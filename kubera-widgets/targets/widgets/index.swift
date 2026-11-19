import SwiftUI
import WidgetKit

@main
struct KuberaWidgetBundle: WidgetBundle {
    var body: some Widget {
        NetWorthWidget()
        AssetsDebtsWidget()
        TopHoldingsWidget()
    }
}

/// Shown when the user hasn't connected their Kubera account yet.
struct SignedOutView: View {
    let family: WidgetFamily

    var body: some View {
        switch family {
        case .accessoryInline:
            Text("Open Kubera Widgets")
        case .accessoryCircular:
            Image(systemName: "person.crop.circle.badge.exclamationmark")
        case .accessoryRectangular:
            Text("Open Kubera Widgets to connect your account")
                .font(.system(size: 12))
        default:
            VStack(spacing: 6) {
                Image(systemName: "key.horizontal")
                    .font(.system(size: 20))
                    .foregroundStyle(WidgetTheme.dim)
                Text("Open Kubera Widgets and connect your account")
                    .font(.system(size: 12))
                    .foregroundStyle(WidgetTheme.dim)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}
