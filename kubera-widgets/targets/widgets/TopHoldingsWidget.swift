import SwiftUI
import WidgetKit

struct TopHoldingsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TopHoldingsWidget", provider: KuberaProvider()) { entry in
            TopHoldingsView(entry: entry)
                .containerBackground(WidgetTheme.background, for: .widget)
        }
        .configurationDisplayName("Top Holdings")
        .description("Your largest assets, ranked.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

struct TopHoldingsView: View {
    @Environment(\.widgetFamily) private var family
    let entry: KuberaEntry

    var body: some View {
        switch entry.state {
        case .signedOut:
            SignedOutView(family: family)
        case .data(let snapshot):
            content(snapshot)
                .widgetURL(URL(string: "kuberawidgets://"))
        }
    }

    private func content(_ snapshot: PortfolioSnapshot) -> some View {
        let limit = family == .systemLarge ? 8 : 3
        let holdings = Array(snapshot.topHoldings.prefix(limit))

        return VStack(alignment: .leading, spacing: family == .systemLarge ? 8 : 5) {
            HStack {
                Text("TOP HOLDINGS")
                    .font(.system(size: 10, weight: .semibold))
                    .kerning(1)
                    .foregroundStyle(WidgetTheme.dim)
                Spacer()
                Text(money(snapshot.netWorth, snapshot))
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(WidgetTheme.text)
            }

            if holdings.isEmpty {
                Spacer()
                Text("No holdings yet")
                    .font(.system(size: 13))
                    .foregroundStyle(WidgetTheme.dim)
                Spacer()
            } else {
                ForEach(holdings, id: \.self) { holding in
                    HStack(spacing: 8) {
                        VStack(alignment: .leading, spacing: 0) {
                            Text(holding.name)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(WidgetTheme.text)
                                .lineLimit(1)
                            if family == .systemLarge, let sheet = holding.sheet, !sheet.isEmpty {
                                Text(sheet)
                                    .font(.system(size: 10))
                                    .foregroundStyle(WidgetTheme.dim)
                                    .lineLimit(1)
                            }
                        }
                        Spacer(minLength: 8)
                        Text(money(holding.value, snapshot))
                            .font(.system(size: 13, weight: .semibold, design: .rounded))
                            .foregroundStyle(WidgetTheme.text)
                            .lineLimit(1)
                    }
                }
                Spacer(minLength: 0)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    private func money(_ amount: Double, _ snapshot: PortfolioSnapshot) -> String {
        Format.money(amount, currency: snapshot.currency, settings: entry.settings)
    }
}
