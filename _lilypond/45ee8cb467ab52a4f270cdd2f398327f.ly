
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

          

\include "../_lilypond_styles/roman_numeral_analysis_tool.ily"

bassline = \relative c'' {
  \clef treble
  \key c \major
  \time 7/4
  \override Staff.TimeSignature #'stencil = ##f
  a c d e g
}

analysis = \lyricmode {
  \override LyricText.self-alignment-X = #-0.6
  \offset StanzaNumber.X-offset #-3
  \set stanza  = #"a:"
  % For bare Roman numerals, \rN simply outputs the string.
  %\markup \rN { I }
  \markup \scaleDegree { 1 }
  \markup \scaleDegree { 3 }
  \markup \scaleDegree { 4 }
  \markup \scaleDegree { 5 }
  \markup \scaleDegree { 7 }
}

\score {
  \new Staff <<
    \new Voice = "bass" { \bassline }
    \new Lyrics \with {
      % to control distance of analysis from staff
      %\override VerticalAxisGroup.nonstaff-relatedstaff-spacing = #'((basic-distance . 6.5))
    } \lyricsto "bass" { \analysis }
  >>
  \layout {
    \context {
      \Score
      % to control horizontal spacing
      \override SpacingSpanner.shortest-duration-space = #6
    }
    \context {
      \Lyrics
      % to control global size
      %\override LyricText.font-size = #-1
    }
  }
  \midi{\tempo 4 = 130}
}
