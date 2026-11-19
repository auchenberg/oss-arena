import SwiftUI
import WidgetKit

struct NetWorthWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NetWorthWidget", provider: KuberaProvider()) { entry in
            NetWorthView(entry: entry)
                .containerBackground(WidgetTheme.background, for: .widget)
        }
        .configurationDisplayName("Net Worth")
        .description("Your Kubera net worth at a glance.")
        .supportedFamilies([
            .systemSmall, .systemMedium,
            .accessoryInline, .accessoryRectangular, .accessoryCircular,
        ])
    }
}

struct NetWorthView: View {
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

    @ViewBuilder
    private func content(_ snapshot: PortfolioSnapshot) -> some View {
        switch family {
        case .accessoryInline:
            Text("Net worth \(money(snapshot.netWorth, snapshot))")
        case .accessoryCircular:
            VStack(spacing: 0) {
                Text("NET")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundStyle(.secondary)
                Text(money(snapshot.netWorth, snapshot, compact: true))
                    .font(.system(size: 13, weight: .bold))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
            }
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 1) {
                Text("NET WORTH")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.secondary)
                Text(money(snapshot.netWorth, snapshot))
                    .font(.system(size: 17, weight: .bold))
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
                if entry.settings.showGain {
                    Text("\(money(snapshot.unrealizedGain, snapshot, signed: true)) unrealized")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        case .systemMedium:
            HStack(alignment: .center, spacing: 16) {
                mainColumn(snapshot)
                Spacer(minLength: 0)
                VStack(alignment: .leading, spacing: 8) {
                    statBlock("ASSETS", money(snapshot.assetTotal, snapshot), WidgetTheme.positive)
                    statBlock("DEBTS", money(snapshot.debtTotal, snapshot), WidgetTheme.negative)
                }
            }
        default: // systemSmall
            VStack(alignment: .leading, spacing: 0) {
                Text("NET WORTH")
                    .font(.system(size: 10, weight: .semibold))
                    .kerning(1)
                    .foregroundStyle(WidgetTheme.dim)
                Spacer(minLength: 2)
                Text(money(snapshot.netWorth, snapshot, compact: true))
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(WidgetTheme.text)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                if entry.settings.showGain {
                    Text(money(snapshot.unrealizedGain, snapshot, compact: true, signed: true))
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(snapshot.unrealizedGain >= 0 ? WidgetTheme.positive : WidgetTheme.negative)
                }
                Spacer(minLength: 2)
                Text(snapshot.portfolioName)
                    .font(.system(size: 11))
                    .foregroundStyle(WidgetTheme.dim)
                    .lineLimit(1)
                Text("Updated \(Format.updatedAt(snapshot.updatedAt))")
                    .font(.system(size: 9))
                    .foregroundStyle(WidgetTheme.dim.opacity(0.7))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
    }

    private func mainColumn(_ snapshot: PortfolioSnapshot) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("NET WORTH")
                .font(.system(size: 10, weight: .semibold))
                .kerning(1)
                .foregroundStyle(WidgetTheme.dim)
            Text(money(snapshot.netWorth, snapshot))
                .font(.system(size: 30, weight: .bold, design: .rounded))
                .foregroundStyle(WidgetTheme.text)
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            if entry.settings.showGain {
                Text("\(money(snapshot.unrealizedGain, snapshot, signed: true)) unrealized")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(snapshot.unrealizedGain >= 0 ? WidgetTheme.positive : WidgetTheme.negative)
            }
            Spacer(minLength: 0)
            Text("\(snapshot.portfolioName) · \(Format.updatedAt(snapshot.updatedAt))")
                .font(.system(size: 10))
                .foregroundStyle(WidgetTheme.dim)
                .lineLimit(1)
        }
    }

    private func statBlock(_ label: String, _ value: String, _ color: Color) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(label)
                .font(.system(size: 9, weight: .semibold))
                .kerning(1)
                .foregroundStyle(WidgetTheme.dim)
            Text(value)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(color)
                .minimumScaleFactor(0.7)
                .lineLimit(1)
        }
    }

    private func money(
        _ amount: Double,
        _ snapshot: PortfolioSnapshot,
        compact: Bool? = nil,
        signed: Bool = false
    ) -> String {
        Format.money(amount, currency: snapshot.currency, settings: entry.settings, compactOverride: compact, signed: signed)
    }
}
