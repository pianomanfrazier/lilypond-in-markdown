
          \version "2.19"
          #(set! paper-alist (cons '("my size" . (cons (* 130 mm) (* 2.3 in))) paper-alist))

          \paper {
              #(set-paper-size "my size")
              indent = 0\mm
              line-width = 125\mm
          }
          \header {
            tagline = ##f %remove default Lilypond footer
          }

          
\score{
	\relative c' {
    c1 f c c \break
    f f c c \break
    g' f c c
	}
	\layout{}
}
