---
title: Lilypond in Markdown
date: 2019-04-15
layout: layouts/base.njk
---

# Lilypond in Markdown

This markdown

```ly/0,7
{% raw %}{% lilypond 'inline', 'preview', '0.7 in' %}
\score{
	\relative c'' {
    g8 e \tuplet 3/2 { f[ a c] } e d a b c4
	}
	\layout{}
}
{% endlilypond %}{% endraw %}
```

renders to this. :o

{% lilypond 'inline', 'preview', '0.7 in' %}
\score{
	\relative c'' {
    g8 e \tuplet 3/2 { f[ a c] } e d a b c4
	}
	\layout{}
}
{% endlilypond %}

The lilypond must be enclosed in Nunjucks tags.
```ly/0,2
{% raw %}{% lilypond 'inline'|'img', 'preview'|'full', 'height' %}
  % lilypond markup ...
{% endlilypond %}{% endraw %}
```

Here is a longer example. Notice how the 2<sup>nd</sup> parameter is marked 'full'. Lilypond will then render the image to the height specified in the 3<sup>rd</sup> parameter. If marked 'preview' the height parameter will be ignored.


```ly/0
{% raw %}{% lilypond 'inline', 'full', '2.3 in' %}
\score{
	\relative c' {
    c1 f c c \break
    f f c c \break
      g' f c c
	}
	\layout{}
}
{% endlilypond %}{% endraw %}
```

{% lilypond 'inline', 'full', '2.3 in' %}
\score{
	\relative c' {
    c1 f c c \break
    f f c c \break
    g' f c c
	}
	\layout{}
}
{% endlilypond %}

Instead of 'inline' for the first parameter, you could put 'external' and the svg would be referenced from a file and not inlined into the html document.

## Chopin

And some Chopin for good measure. ;)

{% lilypond 'inline', 'preview', '2.3 in' %}
rhMusic = \relative c'' {
  \new Voice {
    r2 c4.\( g8 |
    \once \override Tie.staff-position = #3.5
    bes1~ |
    \bar "||"
    \time 6/4
    bes2.^\markup { \bold "Moderato" } r8
    \mergeDifferentlyHeadedOn
    \mergeDifferentlyDottedOn
    % Start polyphonic section of four voices
    <<
      { c,8 d fis bes a }  % continuation of main voice
      \new Voice {
        \voiceTwo
        c,8~
        % Reposition the c2 to the right of the merged note
        \once \override NoteColumn.force-hshift = #1.0
        % Move the c2 out of the main note column
        % so the merge will work
        \shiftOnn
        c2
      }
      \new Voice {
        \voiceThree
        s8
        % Stem on the d2 must be down to permit merging
        \stemDown
        % Stem on the d2 should be invisible
        \tweak Stem.transparent ##t
        d2
      }
      \new Voice {
        \voiceFour
        s4 fis4.
      }
    >> |
    \mergeDifferentlyHeadedOff
    \mergeDifferentlyDottedOff
    g2.\)  % continuation of main voice
  }
}

lhMusic = \relative c' {
  r2 <c g ees>2( |
  <d g, d>1)\arpeggio |
  r2. d,,4 r4 r |
  r4
}

\score {
  \new PianoStaff <<
    \new Staff = "RH"  <<
      \key g \minor
      \rhMusic
    >>
    \new Staff = "LH" <<
      \key g \minor
      \clef "bass"
      \lhMusic
    >>
  >>
}
{% endlilypond %}

The previous example was really long.

```ly
 rhMusic = \relative c'' {
  \new Voice {
    r2 c4.\( g8 |
    \once \override Tie.staff-position = #3.5
    bes1~ |
    \bar "||"
    \time 6/4
    bes2.^\markup { \bold "Moderato" } r8
    \mergeDifferentlyHeadedOn
    \mergeDifferentlyDottedOn
    % Start polyphonic section of four voices
    <<
      { c,8 d fis bes a }  % continuation of main voice
      \new Voice {
        \voiceTwo
        c,8~
        % Reposition the c2 to the right of the merged note
        \once \override NoteColumn.force-hshift = #1.0
        % Move the c2 out of the main note column
        % so the merge will work
        \shiftOnn
        c2
      }
      \new Voice {
        \voiceThree
        s8
        % Stem on the d2 must be down to permit merging
        \stemDown
        % Stem on the d2 should be invisible
        \tweak Stem.transparent ##t
        d2
      }
      \new Voice {
        \voiceFour
          s4 fis4.
      }
    >> |
    \mergeDifferentlyHeadedOff
    \mergeDifferentlyDottedOff
    g2.\)  % continuation of main voice
  }
}

lhMusic = \relative c' {
  r2 <c g ees>2( |
  <d g, d>1)\arpeggio |
  r2. d,,4 r4 r |
  r4
}

\score {
  \new PianoStaff <<
    \new Staff = "RH"  <<
      \key g \minor
      \rhMusic
    >>
    \new Staff = "LH" <<
      \key g \minor
      \clef "bass"
      \lhMusic
    >>
  >>
}
```

## Some vocals

{% lilypond 'inline', 'preview', '2.3 in' %}
global = { \key f \major \time 6/8 \partial 8 }

SopOneMusic = \relative c'' {
  c8 | c8([ bes)] a a([ g)] f | f'4. b, | c4.~ c4
}
SopOneLyrics = \lyricmode {
  Let | flee -- cy flocks the | hills a -- dorn, __
}
SopTwoMusic = \relative c' {
  r8 | r4. r4 c8 | a'8([ g)] f f([ e)] d | e8([ d)] c bes'
}
SopTwoLyrics = \lyricmode {
  Let | flee -- cy flocks the | hills a -- dorn,
}

\score {
  \new ChoirStaff <<
    \new Staff <<
      \new Voice = "SopOne" {
        \global
        \SopOneMusic
      }
      \new Lyrics \lyricsto "SopOne" {
        \SopOneLyrics
      }
    >>
    \new Staff <<
      \new Voice = "SopTwo" {
        \global
        \SopTwoMusic
      }
      \new Lyrics \lyricsto "SopTwo" {
        \SopTwoLyrics
      }
    >>
  >>
}
{% endlilypond %}


```ly
global = { \key f \major \time 6/8 \partial 8 }

SopOneMusic = \relative c'' {
  c8 | c8([ bes)] a a([ g)] f | f'4. b, | c4.~ c4
}
SopOneLyrics = \lyricmode {
  Let | flee -- cy flocks the | hills a -- dorn, __
}
SopTwoMusic = \relative c' {
  r8 | r4. r4 c8 | a'8([ g)] f f([ e)] d | e8([ d)] c bes'
}
SopTwoLyrics = \lyricmode {
  Let | flee -- cy flocks the | hills a -- dorn,
}

\score {
  \new ChoirStaff <<
    \new Staff <<
      \new Voice = "SopOne" {
        \global
        \SopOneMusic
      }
      \new Lyrics \lyricsto "SopOne" {
        \SopOneLyrics
      }
    >>
    \new Staff <<
      \new Voice = "SopTwo" {
        \global
        \SopTwoMusic
      }
      \new Lyrics \lyricsto "SopTwo" {
        \SopTwoLyrics
      }
    >>
  >>
}
```

## An Orchestra Score


{% lilypond 'inline', 'full', '7.5 in' %}
#(set-global-staff-size 17)
\paper {
  indent = 3.0\cm  % space for instrumentName
  short-indent = 1.5\cm  % space for shortInstrumentName
}

fluteMusic = \relative c' { \key g \major g'1 b }
% Pitches as written on a manuscript for Clarinet in A
% are transposed to concert pitch.
clarinetMusic = \transpose c' a
  \relative c'' { \key bes \major bes1 d }
trumpetMusic = \relative c { \key g \major g''1 b }
% Key signature is often omitted for horns
hornMusic = \transpose c' f
  \relative c { d'1 fis }
percussionMusic = \relative c { \key g \major g1 b }
sopranoMusic = \relative c'' { \key g \major g'1 b }
sopranoLyrics = \lyricmode { Lyr -- ics }
altoIMusic = \relative c' { \key g \major g'1 b }
altoIIMusic = \relative c' { \key g \major g'1 b }
altoILyrics =  \sopranoLyrics
altoIILyrics = \lyricmode { Ah -- ah }
tenorMusic = \relative c' { \clef "treble_8" \key g \major g1 b }
tenorLyrics = \sopranoLyrics
pianoRHMusic = \relative c { \key g \major g''1 b }
pianoLHMusic = \relative c { \clef bass \key g \major g1 b }
violinIMusic = \relative c' { \key g \major g'1 b }
violinIIMusic = \relative c' { \key g \major g'1 b }
violaMusic = \relative c { \clef alto \key g \major g'1 b }
celloMusic = \relative c { \clef bass \key g \major g1 b }
bassMusic = \relative c { \clef "bass_8" \key g \major g,1 b }

\score {
  <<
    \new StaffGroup = "StaffGroup_woodwinds" <<
      \new Staff = "Staff_flute" {
        \set Staff.instrumentName = #"Flute"
        % shortInstrumentName, midiInstrument, etc.
        % may be set here as well
        \fluteMusic
      }
      \new Staff = "Staff_clarinet" {
        \set Staff.instrumentName =
        \markup { \concat { "Clarinet in B" \flat } }
        % Declare that written Middle C in the music
        %  to follow sounds a concert B flat, for
        %  output using sounded pitches such as MIDI.
        \transposition bes
        % Print music for a B-flat clarinet
        \transpose bes c' \clarinetMusic
      }
    >>
    \new StaffGroup = "StaffGroup_brass" <<
      \new Staff = "Staff_hornI" {
        \set Staff.instrumentName = #"Horn in F"
        \transposition f
        \transpose f c' \hornMusic
      }
      \new Staff = "Staff_trumpet" {
        \set Staff.instrumentName = #"Trumpet in  C"
        \trumpetMusic
      }
    >>
    \new RhythmicStaff = "RhythmicStaff_percussion" <<
      \set RhythmicStaff.instrumentName = #"Percussion"
      \percussionMusic
    >>
    \new PianoStaff <<
      \set PianoStaff.instrumentName = #"Piano"
      \new Staff { \pianoRHMusic }
      \new Staff { \pianoLHMusic }
    >>
    \new ChoirStaff = "ChoirStaff_choir" <<
      \new Staff = "Staff_soprano" {
        \set Staff.instrumentName = #"Soprano"
        \new Voice = "soprano"
        \sopranoMusic
      }
      \new Lyrics \lyricsto "soprano" { \sopranoLyrics }
      \new GrandStaff = "GrandStaff_altos"
      \with { \accepts Lyrics } <<
        \new Staff = "Staff_altoI"  {
          \set Staff.instrumentName = #"Alto I"
          \new Voice = "altoI"
          \altoIMusic
        }
        \new Lyrics \lyricsto "altoI" { \altoILyrics }
        \new Staff = "Staff_altoII" {
          \set Staff.instrumentName = #"Alto II"
          \new Voice = "altoII"
          \altoIIMusic
        }
        \new Lyrics \lyricsto "altoII" { \altoIILyrics }
      >>
      \new Staff = "Staff_tenor" {
        \set Staff.instrumentName = #"Tenor"
        \new Voice = "tenor"
        \tenorMusic
      }
      \new Lyrics \lyricsto "tenor" { \tenorLyrics }
    >>
    \new StaffGroup = "StaffGroup_strings" <<
      \new GrandStaff = "GrandStaff_violins" <<
        \new Staff = "Staff_violinI" {
          \set Staff.instrumentName = #"Violin I"
          \violinIMusic
        }
        \new Staff = "Staff_violinII" {
          \set Staff.instrumentName = #"Violin II"
          \violinIIMusic
        }
      >>
      \new Staff = "Staff_viola" {
        \set Staff.instrumentName = #"Viola"
        \violaMusic
      }
      \new Staff = "Staff_cello" {
        \set Staff.instrumentName = #"Cello"
        \celloMusic
      }
      \new Staff = "Staff_bass" {
        \set Staff.instrumentName = #"Double Bass"
        \bassMusic
      }
    >>
  >>
  \layout { }
}
{% endlilypond %}

```ly
#(set-global-staff-size 17)
\paper {
  indent = 3.0\cm  % space for instrumentName
  short-indent = 1.5\cm  % space for shortInstrumentName
}

fluteMusic = \relative c' { \key g \major g'1 b }
% Pitches as written on a manuscript for Clarinet in A
% are transposed to concert pitch.
clarinetMusic = \transpose c' a
  \relative c'' { \key bes \major bes1 d }
trumpetMusic = \relative c { \key g \major g''1 b }
% Key signature is often omitted for horns
hornMusic = \transpose c' f
  \relative c { d'1 fis }
percussionMusic = \relative c { \key g \major g1 b }
sopranoMusic = \relative c'' { \key g \major g'1 b }
sopranoLyrics = \lyricmode { Lyr -- ics }
altoIMusic = \relative c' { \key g \major g'1 b }
altoIIMusic = \relative c' { \key g \major g'1 b }
altoILyrics =  \sopranoLyrics
altoIILyrics = \lyricmode { Ah -- ah }
tenorMusic = \relative c' { \clef "treble_8" \key g \major g1 b }
tenorLyrics = \sopranoLyrics
pianoRHMusic = \relative c { \key g \major g''1 b }
pianoLHMusic = \relative c { \clef bass \key g \major g1 b }
violinIMusic = \relative c' { \key g \major g'1 b }
violinIIMusic = \relative c' { \key g \major g'1 b }
violaMusic = \relative c { \clef alto \key g \major g'1 b }
celloMusic = \relative c { \clef bass \key g \major g1 b }
bassMusic = \relative c { \clef "bass_8" \key g \major g,1 b }

\score {
  <<
    \new StaffGroup = "StaffGroup_woodwinds" <<
      \new Staff = "Staff_flute" {
        \set Staff.instrumentName = #"Flute"
        % shortInstrumentName, midiInstrument, etc.
        % may be set here as well
        \fluteMusic
      }
      \new Staff = "Staff_clarinet" {
        \set Staff.instrumentName =
        \markup { \concat { "Clarinet in B" \flat } }
        % Declare that written Middle C in the music
        %  to follow sounds a concert B flat, for
        %  output using sounded pitches such as MIDI.
        \transposition bes
        % Print music for a B-flat clarinet
        \transpose bes c' \clarinetMusic
      }
    >>
    \new StaffGroup = "StaffGroup_brass" <<
      \new Staff = "Staff_hornI" {
        \set Staff.instrumentName = #"Horn in F"
        \transposition f
        \transpose f c' \hornMusic
      }
      \new Staff = "Staff_trumpet" {
        \set Staff.instrumentName = #"Trumpet in  C"
        \trumpetMusic
      }
    >>
    \new RhythmicStaff = "RhythmicStaff_percussion" <<
      \set RhythmicStaff.instrumentName = #"Percussion"
      \percussionMusic
    >>
    \new PianoStaff <<
      \set PianoStaff.instrumentName = #"Piano"
      \new Staff { \pianoRHMusic }
      \new Staff { \pianoLHMusic }
    >>
    \new ChoirStaff = "ChoirStaff_choir" <<
      \new Staff = "Staff_soprano" {
        \set Staff.instrumentName = #"Soprano"
        \new Voice = "soprano"
        \sopranoMusic
      }
      \new Lyrics \lyricsto "soprano" { \sopranoLyrics }
      \new GrandStaff = "GrandStaff_altos"
      \with { \accepts Lyrics } <<
        \new Staff = "Staff_altoI"  {
          \set Staff.instrumentName = #"Alto I"
          \new Voice = "altoI"
          \altoIMusic
        }
        \new Lyrics \lyricsto "altoI" { \altoILyrics }
        \new Staff = "Staff_altoII" {
          \set Staff.instrumentName = #"Alto II"
          \new Voice = "altoII"
          \altoIIMusic
        }
        \new Lyrics \lyricsto "altoII" { \altoIILyrics }
      >>
      \new Staff = "Staff_tenor" {
        \set Staff.instrumentName = #"Tenor"
        \new Voice = "tenor"
        \tenorMusic
      }
      \new Lyrics \lyricsto "tenor" { \tenorLyrics }
    >>
    \new StaffGroup = "StaffGroup_strings" <<
      \new GrandStaff = "GrandStaff_violins" <<
        \new Staff = "Staff_violinI" {
          \set Staff.instrumentName = #"Violin I"
          \violinIMusic
        }
        \new Staff = "Staff_violinII" {
          \set Staff.instrumentName = #"Violin II"
          \violinIIMusic
        }
      >>
      \new Staff = "Staff_viola" {
        \set Staff.instrumentName = #"Viola"
        \violaMusic
      }
      \new Staff = "Staff_cello" {
        \set Staff.instrumentName = #"Cello"
        \celloMusic
      }
      \new Staff = "Staff_bass" {
        \set Staff.instrumentName = #"Double Bass"
        \bassMusic
      }
    >>
  >>
  \layout { }
}
```

## Gregorian Chant

{% lilypond 'inline', 'preview', 'XXX' %}
\include "gregorian.ly"

chant = \relative c' {
  \set Score.timing = ##f
  f4 a2 \divisioMinima
  g4 b a2 f2 \divisioMaior
  g4( f) f( g) a2 \finalis
}

verba = \lyricmode {
  Lo -- rem ip -- sum do -- lor sit a -- met
}

\score {
  \new Staff <<
    \new Voice = "melody" \chant
    \new Lyrics = "one" \lyricsto melody \verba
  >>
  \layout {
    \context {
      \Staff
      \remove "Time_signature_engraver"
      \remove "Bar_engraver"
      \hide Stem
    }
    \context {
      \Voice
      \override Stem.length = #0
    }
    \context {
      \Score
      barAlways = ##t
    }
  }
}
{% endlilypond %}

```ly
\include "gregorian.ly"

chant = \relative c' {
  \set Score.timing = ##f
  f4 a2 \divisioMinima
  g4 b a2 f2 \divisioMaior
  g4( f) f( g) a2 \finalis
}

verba = \lyricmode {
  Lo -- rem ip -- sum do -- lor sit a -- met
}

\score {
  \new Staff <<
    \new Voice = "melody" \chant
    \new Lyrics = "one" \lyricsto melody \verba
  >>
  \layout {
    \context {
      \Staff
      \remove "Time_signature_engraver"
      \remove "Bar_engraver"
      \hide Stem
    }
    \context {
      \Voice
      \override Stem.length = #0
    }
    \context {
      \Score
      barAlways = ##t
    }
  }
}
```

## Figured Bass


{% lilypond 'inline', 'preview', 'XXX' %}
upper = \relative c' {
  \clef treble
  \key c \major
  \time 4/4
  \partial 8 f8

  a4 b c d |
  \time 2/4
  e8 f g a
}

lower = \relative c {
  \clef bass
  \key c \major
  \time 4/4

  \partial 8 r8
  a2 c |
  \time 2/4
  e
}

fb = \figuremode {
  r8 <6>4 <4+ 2/> <6 5- >2 <7 _!>
}

\score {
  \new PianoStaff <<
    \new Staff = "upper" \upper
    \new Staff = "lower" \lower
    \new FiguredBass = "figures" \fb
  >>
  \layout { }
}
{% endlilypond %}

```ly
upper = \relative c' {
  \clef treble
  \key c \major
  \time 4/4
  \partial 8 f8

  a4 b c d |
  \time 2/4
  e8 f g a
}

lower = \relative c {
  \clef bass
  \key c \major
  \time 4/4

  \partial 8 r8
  a2 c |
  \time 2/4
  e
}

fb = \figuremode {
  r8 <6>4 <4+ 2/> <6 5- >2 <7 _!>
}

\score {
  \new PianoStaff <<
    \new Staff = "upper" \upper
    \new Staff = "lower" \lower
    \new FiguredBass = "figures" \fb
  >>
  \layout { }
}
```

## A Schenker Graph

Complements of Kris Shaffer found [here](http://lsr.di.unimi.it/LSR/Item?id=501).

{% lilypond 'inline', 'full', '5 in' %}
%% http://lsr.di.unimi.it/LSR/Search?q=schenker
%% see http://www.lilypond.org/doc/v2.18/Documentation/web-big-page.html

%% last improvement Feb. 2014.
%% updated by P.P.Schneider Feb. 2014.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% LSR workaround:
#(set! paper-alist (cons '("snippet" . (cons (* 190 mm) (* 100 mm))) paper-alist))
\paper {
  #(set-paper-size "snippet")
  indent = 0
  tagline = ##f
}
\markup\vspace #.5
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%here starts the snippet:

\header{
  composer = "J.S. Bach"
  title = "Wenn wir in höchsten Nöten sein"
  subtitle = "Analysis from Gene Biringer's Schenker Text, Ex. 5-27"
% "BWV641"
  enteredby = "Kris Shaffer"
}

% See http://kris.shaffermusic.com/tech.html. for more information

% 'Add color...' sections are not the original author's, but added
% afterwards specifically for illustration in LilyPond's Documentation.

I = \once \override NoteColumn.ignore-collision = ##t

staffPiano = \new PianoStaff {
  \set Score.timing = ##f
  \set PianoStaff.followVoice = ##t
  <<
    \new Staff = "RH" { % Right hand
      \clef treble
      \key g \major
      \relative c'' {
        \override Staff.NoteCollision.merge-differently-headed = ##t
          <<
            {
              \override Beam.positions = #'(8 . 8)
              \hide NoteHead
              \override NoteHead.duration-log = #1
              s1 b8[^\markup 
              {
                  \override #'(baseline-skip . 0.5)
                                % Add color to markup in top staff
                                \column { \with-color #red \small { ^ 3 } }
              }
              s4. s1 a8^\markup 
              {
                \override #'(baseline-skip . 0.5)
                              % Add color to markup in top staff
                              \column { \with-color #red \small { ^ 2 } }
              }
              s4. s2 g8]^\markup 
              {
                            % Add color to markup in top staff
                \override #'(baseline-skip . 0.5)
                \column { \with-color #red \small { ^ 1 } }
              }
              s4.
              \revert Beam.positions
              \undo \hide NoteHead
              \revert NoteHead.duration-log
            }
            \\
            {
                % Add color to both Dashed Slurs in top staff
                \override Slur.color = #(x11-color "purple")
              \hide Stem
              s1
              \once \override Slur.height-limit = #6
              \once \override Slur.extra-offset = #'(1.25 . 0)
              \slurDashed
              \I b2_( s2
              \once \hide NoteHead
              b4) s
              \once \override Slur.height-limit = #3.25
              \once \override Slur.extra-offset = #'(.75 . 0)
              a2_( s4
              \once \hide NoteHead
              a4) g2
              \undo \hide Stem
            }
            \\
            \override Staff.NoteCollision.merge-differently-headed = ##t
            {
              \override Beam.positions = #'(4 . -3.25)
              \stemUp
              g8[ s s4 s2
              \stemDown
              \once \hide NoteHead
              \I b8] s8
              \override Beam.positions = #'(3 . -2.25)
              \stemUp
              a8[ s s4
              \stemDown
              c8] s s2 s s
            }
            \\
            {
                % Add color to all remaining Slurs in top staff
                \override Slur.color = #(x11-color "violet")
                \override PhrasingSlur.color = #(x11-color "violet")
              \hide Stem
              \override Stem.length = #0
                          % Add color to text markups in top staff
              g4_\( fis^(_\markup { \with-color #blue \tiny N } g)\)
              a^(^\markup { \with-color #blue \tiny P } b2)
              b4^(^\markup { \with-color #blue \tiny P }
              \stemUp
              \undo \hide Stem
              \override Stem.length = #10
              c8)^( s
              \override Stem.length = #14
              b4) s s
              \override Stem.length = #0
              \hide Stem
              \once \override Slur.extra-offset = #'(0 . 0.35)
                          % Add color to remaining text markup in top staff
              c4^\( b_(_\markup { \with-color #blue \tiny P } a)\) s2
              \revert Stem.length
            }
            \\
            {
              \hide Stem
              \hide NoteHead
              \override Stem.length = #0
              s1 s4 e4 s
              \change Staff = "LH"
              fis,4 s2
              \undo \hide Stem
              \undo \hide NoteHead
              \revert Stem.length
            }
            \\
            {
              \hide Stem
              \hide NoteHead
              \override Stem.length = #0
              s1 s s2
              fis'4 s
              \change Staff = "LH"
              g,4 s s2
              \undo \hide Stem
              \undo \hide NoteHead
              \revert Stem.length
            }
          >>
          \bar "|."
        }
      }

      \new Staff = "LH" { % Left hand
        \clef bass
        \key g \major
        \relative c' {
        \override Staff.NoteCollision.merge-differently-headed = ##t
        <<
        {
          \override Beam.positions = #'(-8 . -8)
          \hide NoteHead
          \stemDown
                      % Add color to long beam text markups in bottom staff
          \I g8[_\markup { \with-color #(x11-color 'LawnGreen) \bold I }
                      s4. s1 s s2
          \I d8_\markup { \with-color #(x11-color 'LawnGreen) \bold V }
                      s4.
          \I g,8]_\markup { \with-color #(x11-color 'LawnGreen) \bold I }
                      s4.
          \revert Beam.positions
          \undo \hide NoteHead
        }
        \\
        {
        \hide Stem
          \stemDown
          \override TextScript.extra-offset = #'(-11.75 . -12.25)
          \I g'2 s1 s s2 \I d2 g,2
          \undo \hide Stem
        }			
        \\
        {
            % Add color to all single-note Slurs in bottom staff
            \override Slur.color = #(x11-color "violet")
          \hide Stem
          \once \hide NoteHead
          \override Stem.length = #0
          g'4
          \once \override TextScript.padding = #0.25
                      % Add color to text markups in bottom staff
          a4_(^\markup { \with-color #blue \tiny P } b)
          fis4^(^\markup { \with-color #blue \tiny P } e)
          \once \hide NoteHead
          \once \override Slur.height-limit = #1.5
                      % Add color to remaining text markup in bottom staff
          c4^( d)^\markup { \with-color #blue \tiny N }
          \once \hide NoteHead
          \once \override Slur.extra-offset = #'(0 . 0.5)
          \I fis,4_(
          \undo \hide Stem
          \override Stem.length = #10
          \stemDown
          g4) s
          \once \override Slur.extra-offset = #'(0 . 0.25)
          \I c8_( s
          \hide Stem
          \revert Stem.length
          a4)
          \once \hide NoteHead
          \I d4^( d,4) s2
        }
        \\
        {
            % Add color to all two-note Slurs in bottom staff
            \override Slur.color = #(x11-color "violet")
          \hide Stem
          \hide NoteHead
          \I g'4^( s b) s2
          \undo \hide Stem
          \undo \hide NoteHead
          \override Beam.positions = #'(-4 . 1)
          \stemDown
          c,8[ s s4
          \stemUp
          fis,8] s
          \override Beam.positions = #'(1 . -4)
          g8[ s
          \stemDown
          b8] s
          \revert Beam.positions
          \hide Stem
          \hide NoteHead
          c4^( s d4) s s2
        }
        \\
        {
            % Add color to four-note Slur in bottom staff
            \override Slur.color = #(x11-color "violet")
          \hide Stem
          \hide NoteHead
          \override Stem.length = #0
          \stemDown
          \once \override Slur.height-limit = #3
          \once \override Slur.extra-offset = #'(0 . 0.25)
          \I g4_( s2. e4) s2. s2 s1 s2
          \undo \hide Stem
          \undo \hide NoteHead
        }
        \\
        {
            % Add color to dashed Slur in bottom staff
            \override Slur.color = #(x11-color "purple")
          \hide Stem
          \hide NoteHead
          \slurDashed
          \once \override Slur.height-limit = #6.0
          \once \override Slur.extra-offset = #'(0.5 . -0.25)
          \override Stem.length = #0
          g4_( s2. s1 g,4) s s1 s2
          \undo \hide Stem
          \undo \hide NoteHead
        }
      >>
      \bar "|."
      }
    }
  >>
}

\score {
  <<
    \staffPiano
  >>
  \layout {
    indent = 0.0
    ragged-right = ##f
    \context { \Staff \remove "Time_signature_engraver" }
  }
}
{% endlilypond %}

```ly
%% http://lsr.di.unimi.it/LSR/Search?q=schenker
%% see http://www.lilypond.org/doc/v2.18/Documentation/web-big-page.html

%% last improvement Feb. 2014.
%% updated by P.P.Schneider Feb. 2014.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% LSR workaround:
#(set! paper-alist (cons '("snippet" . (cons (* 190 mm) (* 100 mm))) paper-alist))
\paper {
  #(set-paper-size "snippet")
  indent = 0
  tagline = ##f
}
\markup\vspace #.5
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%here starts the snippet:

\header{
  composer = "J.S. Bach"
  title = "Wenn wir in höchsten Nöten sein"
  subtitle = "Analysis from Gene Biringer's Schenker Text, Ex. 5-27"
% "BWV641"
  enteredby = "Kris Shaffer"
}

% See http://kris.shaffermusic.com/tech.html. for more information

% 'Add color...' sections are not the original author's, but added
% afterwards specifically for illustration in LilyPond's Documentation.

I = \once \override NoteColumn.ignore-collision = ##t

staffPiano = \new PianoStaff {
  \set Score.timing = ##f
  \set PianoStaff.followVoice = ##t
  <<
    \new Staff = "RH" { % Right hand
      \clef treble
      \key g \major
      \relative c'' {
        \override Staff.NoteCollision.merge-differently-headed = ##t
          <<
            {
              \override Beam.positions = #'(8 . 8)
              \hide NoteHead
              \override NoteHead.duration-log = #1
              s1 b8[^\markup 
              {
                  \override #'(baseline-skip . 0.5)
                                % Add color to markup in top staff
                                \column { \with-color #red \small { ^ 3 } }
              }
              s4. s1 a8^\markup 
              {
                \override #'(baseline-skip . 0.5)
                              % Add color to markup in top staff
                              \column { \with-color #red \small { ^ 2 } }
              }
              s4. s2 g8]^\markup 
              {
                            % Add color to markup in top staff
                \override #'(baseline-skip . 0.5)
                \column { \with-color #red \small { ^ 1 } }
              }
              s4.
              \revert Beam.positions
              \undo \hide NoteHead
              \revert NoteHead.duration-log
            }
            \\
            {
                % Add color to both Dashed Slurs in top staff
                \override Slur.color = #(x11-color "purple")
              \hide Stem
              s1
              \once \override Slur.height-limit = #6
              \once \override Slur.extra-offset = #'(1.25 . 0)
              \slurDashed
              \I b2_( s2
              \once \hide NoteHead
              b4) s
              \once \override Slur.height-limit = #3.25
              \once \override Slur.extra-offset = #'(.75 . 0)
              a2_( s4
              \once \hide NoteHead
              a4) g2
              \undo \hide Stem
            }
            \\
            \override Staff.NoteCollision.merge-differently-headed = ##t
            {
              \override Beam.positions = #'(4 . -3.25)
              \stemUp
              g8[ s s4 s2
              \stemDown
              \once \hide NoteHead
              \I b8] s8
              \override Beam.positions = #'(3 . -2.25)
              \stemUp
              a8[ s s4
              \stemDown
              c8] s s2 s s
            }
            \\
            {
                % Add color to all remaining Slurs in top staff
                \override Slur.color = #(x11-color "violet")
                \override PhrasingSlur.color = #(x11-color "violet")
              \hide Stem
              \override Stem.length = #0
                          % Add color to text markups in top staff
              g4_\( fis^(_\markup { \with-color #blue \tiny N } g)\)
              a^(^\markup { \with-color #blue \tiny P } b2)
              b4^(^\markup { \with-color #blue \tiny P }
              \stemUp
              \undo \hide Stem
              \override Stem.length = #10
              c8)^( s
              \override Stem.length = #14
              b4) s s
              \override Stem.length = #0
              \hide Stem
              \once \override Slur.extra-offset = #'(0 . 0.35)
                          % Add color to remaining text markup in top staff
              c4^\( b_(_\markup { \with-color #blue \tiny P } a)\) s2
              \revert Stem.length
            }
            \\
            {
              \hide Stem
              \hide NoteHead
              \override Stem.length = #0
              s1 s4 e4 s
              \change Staff = "LH"
              fis,4 s2
              \undo \hide Stem
              \undo \hide NoteHead
              \revert Stem.length
            }
            \\
            {
              \hide Stem
              \hide NoteHead
              \override Stem.length = #0
              s1 s s2
              fis'4 s
              \change Staff = "LH"
              g,4 s s2
              \undo \hide Stem
              \undo \hide NoteHead
              \revert Stem.length
            }
          >>
          \bar "|."
        }
      }

      \new Staff = "LH" { % Left hand
        \clef bass
        \key g \major
        \relative c' {
        \override Staff.NoteCollision.merge-differently-headed = ##t
        <<
        {
          \override Beam.positions = #'(-8 . -8)
          \hide NoteHead
          \stemDown
                      % Add color to long beam text markups in bottom staff
          \I g8[_\markup { \with-color #(x11-color 'LawnGreen) \bold I }
                      s4. s1 s s2
          \I d8_\markup { \with-color #(x11-color 'LawnGreen) \bold V }
                      s4.
          \I g,8]_\markup { \with-color #(x11-color 'LawnGreen) \bold I }
                      s4.
          \revert Beam.positions
          \undo \hide NoteHead
        }
        \\
        {
        \hide Stem
          \stemDown
          \override TextScript.extra-offset = #'(-11.75 . -12.25)
          \I g'2 s1 s s2 \I d2 g,2
          \undo \hide Stem
        }			
        \\
        {
            % Add color to all single-note Slurs in bottom staff
            \override Slur.color = #(x11-color "violet")
          \hide Stem
          \once \hide NoteHead
          \override Stem.length = #0
          g'4
          \once \override TextScript.padding = #0.25
                      % Add color to text markups in bottom staff
          a4_(^\markup { \with-color #blue \tiny P } b)
          fis4^(^\markup { \with-color #blue \tiny P } e)
          \once \hide NoteHead
          \once \override Slur.height-limit = #1.5
                      % Add color to remaining text markup in bottom staff
          c4^( d)^\markup { \with-color #blue \tiny N }
          \once \hide NoteHead
          \once \override Slur.extra-offset = #'(0 . 0.5)
          \I fis,4_(
          \undo \hide Stem
          \override Stem.length = #10
          \stemDown
          g4) s
          \once \override Slur.extra-offset = #'(0 . 0.25)
          \I c8_( s
          \hide Stem
          \revert Stem.length
          a4)
          \once \hide NoteHead
          \I d4^( d,4) s2
        }
        \\
        {
            % Add color to all two-note Slurs in bottom staff
            \override Slur.color = #(x11-color "violet")
          \hide Stem
          \hide NoteHead
          \I g'4^( s b) s2
          \undo \hide Stem
          \undo \hide NoteHead
          \override Beam.positions = #'(-4 . 1)
          \stemDown
          c,8[ s s4
          \stemUp
          fis,8] s
          \override Beam.positions = #'(1 . -4)
          g8[ s
          \stemDown
          b8] s
          \revert Beam.positions
          \hide Stem
          \hide NoteHead
          c4^( s d4) s s2
        }
        \\
        {
            % Add color to four-note Slur in bottom staff
            \override Slur.color = #(x11-color "violet")
          \hide Stem
          \hide NoteHead
          \override Stem.length = #0
          \stemDown
          \once \override Slur.height-limit = #3
          \once \override Slur.extra-offset = #'(0 . 0.25)
          \I g4_( s2. e4) s2. s2 s1 s2
          \undo \hide Stem
          \undo \hide NoteHead
        }
        \\
        {
            % Add color to dashed Slur in bottom staff
            \override Slur.color = #(x11-color "purple")
          \hide Stem
          \hide NoteHead
          \slurDashed
          \once \override Slur.height-limit = #6.0
          \once \override Slur.extra-offset = #'(0.5 . -0.25)
          \override Stem.length = #0
          g4_( s2. s1 g,4) s s1 s2
          \undo \hide Stem
          \undo \hide NoteHead
        }
      >>
      \bar "|."
      }
    }
  >>
}

\score {
  <<
    \staffPiano
  >>
  \layout {
    indent = 0.0
    ragged-right = ##f
    \context { \Staff \remove "Time_signature_engraver" }
  }
}
```
