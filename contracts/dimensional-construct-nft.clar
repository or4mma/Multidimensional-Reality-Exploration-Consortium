;; Dimensional Construct NFT Contract

(define-non-fungible-token dimensional-construct uint)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_CONSTRUCT (err u101))

;; Data variables
(define-data-var last-token-id uint u0)

;; Data maps
(define-map token-metadata
  uint
  {
    creator: principal,
    name: (string-ascii 64),
    description: (string-utf8 256),
    dimensions: uint,
    visualization-url: (string-ascii 256),
    creation-time: uint
  }
)

;; Public functions
(define-public (mint-construct (name (string-ascii 64)) (description (string-utf8 256)) (dimensions uint) (visualization-url (string-ascii 256)))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (try! (nft-mint? dimensional-construct token-id tx-sender))
    (map-set token-metadata
      token-id
      {
        creator: tx-sender,
        name: name,
        description: description,
        dimensions: dimensions,
        visualization-url: visualization-url,
        creation-time: block-height
      }
    )
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (transfer-construct (token-id uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? dimensional-construct token-id) ERR_INVALID_CONSTRUCT)) ERR_NOT_AUTHORIZED)
    (try! (nft-transfer? dimensional-construct token-id tx-sender recipient))
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-construct-metadata (token-id uint))
  (map-get? token-metadata token-id)
)

(define-read-only (get-construct-owner (token-id uint))
  (nft-get-owner? dimensional-construct token-id)
)

(define-read-only (get-last-token-id)
  (var-get last-token-id)
)

