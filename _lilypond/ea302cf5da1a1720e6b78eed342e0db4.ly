
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

          

rhMusic = \relative c'' {
    \clef "treble"
    c8 <dis fis> <e g> 
    c8 <dis fis> <e g> 
    c8 <dis fis> |
    <e g> 
    c8 <dis fis> <e g> 
    bes'2
}

lhMusic =	\relative c, {
    \clef "bass_8"
    c8 c' e, f fis g g, g'
    c, c' e, f fis g g, g'
}

\score {
  \new PianoStaff <<
    \new Staff = "RH"  <<
      \rhMusic
    >>
    \new Staff = "LH" <<
      \lhMusic
    >>
  >>
  \layout{}
  \midi{\tempo 4 = 130}
}
