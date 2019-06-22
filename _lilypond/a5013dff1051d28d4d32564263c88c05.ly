
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
    fis8 g c fis, g bes 
    fis g c fis, g bes 
    \tweak color #magenta 
    g
    \tweak color #magenta 
    gis
    \tweak color #magenta 
    a
    \tweak color #magenta 
    c
    \tweak color #magenta 
    d
    \tweak color #magenta 
    c
  }
  \layout{}
  \midi{\tempo 4 = 130}
}
