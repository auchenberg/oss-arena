import Foundation
import SwiftUI

enum Format {
    static let masked = "••••••"

    /// "$1.24M" style compact currency, or full grouping when compact is off.
    static func money(
        _ amount: Double,
        currency: String,
        settings: WidgetSettings,
        compactOverride: Bool? = nil,
        signed: Bool = false
    ) -> String {
        if settings.privacyMode { return masked }

        let compact = compactOverride ?? settings.compactNumbers
        let sign = signed && amount > 0 ? "+" : (amount < 0 ? "-" : "")
        let absolute = abs(amount)
        let symbol = currencySymbol(for: currency)

        if compact, absolute >= 100_000 {
            let (value, suffix): (Double, String) =
                absolute >= 1_000_000_000 ? (absolute / 1_000_000_000, "B")
                : absolute >= 1_000_000 ? (absolute / 1_000_000, "M")
                : (absolute / 1_000, "K")
            let digits = value >= 100 ? 0 : (value >= 10 ? 1 : 2)
            return "\(sign)\(symbol)\(String(format: "%.\(digits)f", value))\(suffix)"
        }

        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        formatter.maximumFractionDigits = 0
        if let formatted = formatter.string(from: NSNumber(value: absolute)) {
            return "\(sign)\(formatted)"
        }
        return "\(sign)\(symbol)\(Int(absolute))"
    }

    private static func currencySymbol(for code: String) -> String {
        switch code {
        case "USD", "CAD", "AUD", "NZD", "HKD", "SGD": return "$"
        case "EUR": return "€"
        case "GBP": return "£"
        case "JPY", "CNY": return "¥"
        case "INR": return "₹"
        case "DKK", "SEK", "NOK": return "kr "
        default: return "\(code) "
        }
    }

    static func updatedAt(_ unixSeconds: Double) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        return formatter.string(from: Date(timeIntervalSince1970: unixSeconds))
    }
}

enum WidgetTheme {
    static let background = Color(red: 0.043, green: 0.055, blue: 0.102) // #0B0E1A
    static let text = Color(red: 0.961, green: 0.969, blue: 0.980) // #F5F7FA
    static let dim = Color(red: 0.541, green: 0.576, blue: 0.651) // #8A93A6
    static let positive = Color(red: 0.290, green: 0.871, blue: 0.502) // #4ADE80
    static let negative = Color(red: 0.973, green: 0.443, blue: 0.443) // #F87171
}
