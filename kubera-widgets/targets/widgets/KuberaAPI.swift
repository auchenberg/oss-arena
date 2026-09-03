import CryptoKit
import Foundation

/// Minimal read-only Kubera API client so widgets can refresh themselves
/// without the app running. Mirrors `src/lib/kubera.ts`: requests are signed
/// with HMAC-SHA256 over `apiKey + unixTimestamp + METHOD + path`.
enum KuberaAPI {
    enum APIError: Error {
        case badResponse
        case unauthorized
        case emptyPortfolio
    }

    private static let baseURL = "https://api.kubera.com"

    private static func request(_ path: String, creds: KuberaCredentials) async throws -> Data {
        let timestamp = String(Int(Date().timeIntervalSince1970))
        let payload = "\(creds.apiKey)\(timestamp)GET\(path)"
        let key = SymmetricKey(data: Data(creds.secret.utf8))
        let signature = HMAC<SHA256>.authenticationCode(for: Data(payload.utf8), using: key)
            .map { String(format: "%02x", $0) }
            .joined()

        guard let url = URL(string: baseURL + path) else { throw APIError.badResponse }
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(creds.apiKey, forHTTPHeaderField: "x-api-token")
        request.setValue(timestamp, forHTTPHeaderField: "x-timestamp")
        request.setValue(signature, forHTTPHeaderField: "x-signature")

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.badResponse }
        if http.statusCode == 401 { throw APIError.unauthorized }
        guard (200 ..< 300).contains(http.statusCode) else { throw APIError.badResponse }
        return data
    }

    // MARK: - Response models

    private struct PortfolioListResponse: Decodable {
        let data: [PortfolioRef]?
    }

    private struct PortfolioRef: Decodable {
        let id: String
    }

    private struct PortfolioDetailResponse: Decodable {
        let data: PortfolioData?
    }

    private struct PortfolioData: Decodable {
        let id: String
        let name: String
        let ticker: String?
        let currency: String?
        let netWorth: Double?
        let assetTotal: Double?
        let debtTotal: Double?
        let costBasis: Double?
        let unrealizedGain: Double?
        let allocationByAssetClass: [String: Double?]?
        let asset: [Asset]?
    }

    private struct Asset: Decodable {
        let name: String
        let value: Value?
        let sheetName: String?
    }

    private struct Value: Decodable {
        let amount: Double?
    }

    // MARK: - Public API

    /// Fetches a fresh snapshot for the portfolio selected in the app,
    /// falling back to the account's first portfolio.
    static func fetchSnapshot(creds: KuberaCredentials, portfolioId: String?) async throws -> PortfolioSnapshot {
        var id = portfolioId
        if id == nil {
            let listData = try await request("/api/v3/data/portfolio", creds: creds)
            let list = try JSONDecoder().decode(PortfolioListResponse.self, from: listData)
            id = list.data?.first?.id
        }
        guard let portfolioId = id else { throw APIError.emptyPortfolio }

        let data = try await request("/api/v3/data/portfolio/\(portfolioId)", creds: creds)
        let detail = try JSONDecoder().decode(PortfolioDetailResponse.self, from: data)
        guard let d = detail.data else { throw APIError.emptyPortfolio }

        let holdings = (d.asset ?? [])
            .map { Holding(name: $0.name, value: $0.value?.amount ?? 0, sheet: $0.sheetName) }
            .sorted { $0.value > $1.value }
            .prefix(8)

        var allocation: [String: Double] = [:]
        for (key, value) in d.allocationByAssetClass ?? [:] {
            if let value, value > 0 { allocation[key] = value }
        }

        return PortfolioSnapshot(
            portfolioId: d.id,
            portfolioName: d.name,
            currency: d.ticker ?? d.currency ?? "USD",
            netWorth: d.netWorth ?? 0,
            assetTotal: d.assetTotal ?? 0,
            debtTotal: d.debtTotal ?? 0,
            costBasis: d.costBasis ?? 0,
            unrealizedGain: d.unrealizedGain ?? 0,
            topHoldings: Array(holdings),
            allocation: allocation,
            updatedAt: Date().timeIntervalSince1970
        )
    }
}
