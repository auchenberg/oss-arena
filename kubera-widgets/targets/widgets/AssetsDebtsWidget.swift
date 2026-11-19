import SwiftUI
import WidgetKit

struct AssetsDebtsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "AssetsDebtsWidget", provider: KuberaProvider()) { entry in
            AssetsDebtsView(entry: entry)
                .containerBackground(WidgetTheme.background, for: .widget)
        }
        .configurationDisplayName("Assets vs Debts")
        .description("How your assets stack up against your debts.")
        .supportedFamilies([.systemMedium])
    }
}

struct AssetsDebtsView: View {
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
        let total = max(snapshot.assetTotal, 1)
        let debtRatio = min(max(snapshot.debtTotal / total, 0), 1)

        return VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("ASSETS")
                        .font(.system(size: 9, weight: .semibold))
                        .kerning(1)
                        .foregroundStyle(WidgetTheme.dim)
                    Text(money(snapshot.assetTotal, snapshot))
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(WidgetTheme.positive)
                        .minimumScaleFactor(0.7)
                        .lineLimit(1)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 1) {
                    Text("DEBTS")
                        .font(.system(size: 9, weight: .semibold))
                        .kerning(1)
                        .foregroundStyle(WidgetTheme.dim)
                    Text(money(snapshot.debtTotal, snapshot))
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(WidgetTheme.negative)
                        .minimumScaleFactor(0.7)
                        .lineLimit(1)
                }
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 5)
                        .fill(WidgetTheme.positive.opacity(0.85))
                    RoundedRectangle(cornerRadius: 5)
                        .fill(WidgetTheme.negative.opacity(0.9))
                        .frame(width: max(geo.size.width * debtRatio, snapshot.debtTotal > 0 ? 6 : 0))
                }
            }
            .frame(height: 10)

            HStack {
                Text("NET \(money(snapshot.netWorth, snapshot))")
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundStyle(WidgetTheme.text)
                Spacer()
                Text("Updated \(Format.updatedAt(snapshot.updatedAt))")
                    .font(.system(size: 10))
                    .foregroundStyle(WidgetTheme.dim)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func money(_ amount: Double, _ snapshot: PortfolioSnapshot) -> String {
        Format.money(amount, currency: snapshot.currency, settings: entry.settings)
    }
}
