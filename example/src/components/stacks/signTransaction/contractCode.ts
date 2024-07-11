export const code = `
(define-data-var greeting (string-ascii 100) "Hello, World!")

(define-read-only (get-greeting)
  (ok (var-get greeting))
)

(define-public (set-greeting (new-greeting (string-ascii 100)))
  (begin
    (var-set greeting new-greeting)
    (ok new-greeting))
)
`;
