
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
    d8 ees \tuplet 3/2 { e[ g a] } <e g a c>4 <f a b d>8 <e g a c>4. 
  }
  \layout{}
  \midi{\tempo 4 = 130}
}
