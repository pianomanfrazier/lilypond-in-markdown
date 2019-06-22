
          \version "2.19"
          #(set! paper-alist (cons '("my size" . (cons (* 130 mm) (* 0.7 in))) paper-alist))

          \paper {
              #(set-paper-size "my size")
              indent = 0\mm
              line-width = 125\mm
          }
          \header {
            tagline = ##f %remove default Lilypond footer
          }

          
\score {
  \relative c'' {
    \clef "treble"
    \time 8/4
    \override Staff.TimeSignature #'stencil = ##f
    c d \tweak color #magenta ees e g \tweak color #magenta aes a
  }
  \layout{}
  \midi{\tempo 4 = 130}
}
