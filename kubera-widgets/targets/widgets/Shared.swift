import Foundation

/// Keys and models shared with the React Native app.
/// Keep in sync with `src/lib/shared-storage.ts` and `src/lib/types.ts`.
enum SharedKeys {
    static let appGroup = "group.com.auchenberg.kuberawidgets"
    static let credentials = "kubera.credentials"
    static let selectedPortfolioId = "kubera.selectedPortfolioId"
    static let settings = "kubera.settings"
    static let snapshot = "kubera.snapshot"
}

struct KuberaCredentials: Codable {
    let apiKey: String
    let secret: String
}

struct Holding: Codable, Hashable {
    let name: String
    let value: Double
    let sheet: String?
}

struct PortfolioSnapshot: Codable {
    let portfolioId: String
    let portfolioName: String
    let currency: String
    let netWorth: Double
    let assetTotal: Double
    let debtTotal: Double
    let costBasis: Double
    let unrealizedGain: Double
    let topHoldings: [Holding]
    let allocation: [String: Double]
    let updatedAt: Double
}

struct WidgetSettings: Codable {
    var privacyMode: Bool = false
    var showGain: Bool = true
    var compactNumbers: Bool = true

    init() {}

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        privacyMode = try container.decodeIfPresent(Bool.self, forKey: .privacyMode) ?? false
        showGain = try container.decodeIfPresent(Bool.self, forKey: .showGain) ?? true
        compactNumbers = try container.decodeIfPresent(Bool.self, forKey: .compactNumbers) ?? true
    }
}

/// Reads and writes the NSUserDefaults suite shared with the app.
enum SharedStore {
    private static var defaults: UserDefaults? {
        UserDefaults(suiteName: SharedKeys.appGroup)
    }

    private static func decode<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let raw = defaults?.string(forKey: key), let data = raw.data(using: .utf8) else {
            return nil
        }
        return try? JSONDecoder().decode(type, from: data)
    }

    static func credentials() -> KuberaCredentials? {
        decode(KuberaCredentials.self, forKey: SharedKeys.credentials)
    }

    static func selectedPortfolioId() -> String? {
        defaults?.string(forKey: SharedKeys.selectedPortfolioId)
    }

    static func settings() -> WidgetSettings {
        decode(WidgetSettings.self, forKey: SharedKeys.settings) ?? WidgetSettings()
    }

    static func cachedSnapshot() -> PortfolioSnapshot? {
        decode(PortfolioSnapshot.self, forKey: SharedKeys.snapshot)
    }

    static func cache(snapshot: PortfolioSnapshot) {
        guard let data = try? JSONEncoder().encode(snapshot),
              let raw = String(data: data, encoding: .utf8) else { return }
        defaults?.set(raw, forKey: SharedKeys.snapshot)
    }
}

extension PortfolioSnapshot {
    static let sample = PortfolioSnapshot(
        portfolioId: "sample",
        portfolioName: "Main portfolio",
        currency: "USD",
        netWorth: 1_240_000,
        assetTotal: 1_610_000,
        debtTotal: 370_000,
        costBasis: 1_026_000,
        unrealizedGain: 214_000,
        topHoldings: [
            Holding(name: "Index funds", value: 620_000, sheet: "Investments"),
            Holding(name: "Home", value: 450_000, sheet: "Real estate"),
            Holding(name: "Bitcoin", value: 96_000, sheet: "Crypto"),
            Holding(name: "Cash", value: 74_000, sheet: "Banks"),
        ],
        allocation: ["Investable": 64, "Real estate": 28, "Crypto": 8],
        updatedAt: Date().timeIntervalSince1970
    )
}
