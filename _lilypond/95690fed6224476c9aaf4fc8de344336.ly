
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
	\relative c, {
    \clef "bass_8"
    <c g'>8 <c g'> <c a'> <c a'>
    <c g'>8 <c g'> <c a'> <c a'>
    <f c'>8 <f c'> <f d'> <f d'>
    <f c'>8 <f c'> <f d'> <f d'>
	}
	\layout{}
  \midi{\tempo 4 = 130}
}
