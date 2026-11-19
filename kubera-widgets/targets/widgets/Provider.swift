import WidgetKit

struct KuberaEntry: TimelineEntry {
    enum State {
        case signedOut
        case data(PortfolioSnapshot)
    }

    let date: Date
    let state: State
    let settings: WidgetSettings

    static var sample: KuberaEntry {
        KuberaEntry(date: Date(), state: .data(.sample), settings: WidgetSettings())
    }
}

/// One provider drives every widget kind: it renders the cached snapshot
/// instantly and refreshes from the Kubera API in the timeline pass.
struct KuberaProvider: TimelineProvider {
    func placeholder(in context: Context) -> KuberaEntry {
        .sample
    }

    func getSnapshot(in context: Context, completion: @escaping (KuberaEntry) -> Void) {
        if context.isPreview {
            // Widget gallery: show real data when available, sample otherwise.
            if let cached = SharedStore.cachedSnapshot() {
                completion(KuberaEntry(date: Date(), state: .data(cached), settings: SharedStore.settings()))
            } else {
                completion(.sample)
            }
            return
        }
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<KuberaEntry>) -> Void) {
        guard let creds = SharedStore.credentials() else {
            let entry = KuberaEntry(date: Date(), state: .signedOut, settings: SharedStore.settings())
            completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(60 * 60))))
            return
        }

        Task {
            let settings = SharedStore.settings()
            do {
                let snapshot = try await KuberaAPI.fetchSnapshot(
                    creds: creds,
                    portfolioId: SharedStore.selectedPortfolioId()
                )
                SharedStore.cache(snapshot: snapshot)
                let entry = KuberaEntry(date: Date(), state: .data(snapshot), settings: settings)
                completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(30 * 60))))
            } catch {
                // Network or auth failure: keep showing the cached numbers and retry sooner.
                let entry = currentEntry()
                completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60))))
            }
        }
    }

    private func currentEntry() -> KuberaEntry {
        let settings = SharedStore.settings()
        guard SharedStore.credentials() != nil else {
            return KuberaEntry(date: Date(), state: .signedOut, settings: settings)
        }
        if let cached = SharedStore.cachedSnapshot() {
            return KuberaEntry(date: Date(), state: .data(cached), settings: settings)
        }
        return KuberaEntry(date: Date(), state: .signedOut, settings: settings)
    }
}
