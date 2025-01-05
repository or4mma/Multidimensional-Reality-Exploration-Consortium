;; Theory Management Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_THEORY (err u101))
(define-constant ERR_INVALID_VOTE (err u102))

;; Data variables
(define-data-var theory-count uint u0)

;; Data maps
(define-map theories
  uint
  {
    creator: principal,
    title: (string-ascii 64),
    description: (string-utf8 1024),
    dimensions: uint,
    creation-time: uint,
    votes: uint,
    status: (string-ascii 20)
  }
)

(define-map theory-votes
  { theory-id: uint, voter: principal }
  { vote: int }
)

;; Public functions
(define-public (submit-theory (title (string-ascii 64)) (description (string-utf8 1024)) (dimensions uint))
  (let
    (
      (theory-id (+ (var-get theory-count) u1))
    )
    (map-set theories
      theory-id
      {
        creator: tx-sender,
        title: title,
        description: description,
        dimensions: dimensions,
        creation-time: block-height,
        votes: u0,
        status: "pending"
      }
    )
    (var-set theory-count theory-id)
    (ok theory-id)
  )
)

(define-public (vote-on-theory (theory-id uint) (vote int))
  (let
    (
      (theory (unwrap! (map-get? theories theory-id) ERR_INVALID_THEORY))
      (previous-vote (default-to { vote: 0 } (map-get? theory-votes { theory-id: theory-id, voter: tx-sender })))
    )
    (asserts! (and (>= vote -1) (<= vote 1)) ERR_INVALID_VOTE)
    (map-set theory-votes
      { theory-id: theory-id, voter: tx-sender }
      { vote: vote }
    )
    (map-set theories
      theory-id
      (merge theory {
        votes: (+ (get votes theory) (to-uint (- vote (get vote previous-vote))))
      })
    )
    (ok true)
  )
)

(define-public (update-theory-status (theory-id uint) (new-status (string-ascii 20)))
  (let
    (
      (theory (unwrap! (map-get? theories theory-id) ERR_INVALID_THEORY))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ok (map-set theories
      theory-id
      (merge theory { status: new-status })
    ))
  )
)

;; Read-only functions
(define-read-only (get-theory (theory-id uint))
  (map-get? theories theory-id)
)

(define-read-only (get-theory-vote (theory-id uint) (voter principal))
  (map-get? theory-votes { theory-id: theory-id, voter: voter })
)

(define-read-only (get-theory-count)
  (var-get theory-count)
)

