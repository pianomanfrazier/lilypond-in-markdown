---
title: Lilypond & Audio in Markdown
date: 2019-06-14
layout: layouts/lilycode.njk
---

# LilyPond & Audio from Markdown

The audio generated is not web midi. The web midi has limited support so we will just use [howler.js](https://howlerjs.com/) to build a simple music player.

LilyPond can generate a midi file. The midi will then be processed to generate sound files. These sound files will be served up with each LilyPond snippet.

## A Bebop Lick

{% lilycode %}
\score{
	\relative c'' {
    g8 e \tuplet 3/2 { f[ a c] } e d a b c4
	}
	\layout{}
  % don't forget to output midi!!!
  % another comment
  \midi{ \tempo 4 = 130 }
}
{% endlilycode %}

{% lilyaudio 'inline', 'preview', '0.7 in', 'piano' %}
\score{
	\relative c'' {
    g8 e \tuplet 3/2 { f[ a c] } e d a b c4
	}
	\layout{}
  % don't forget to output midi!!!
  \midi{\tempo 4 = 130}
}
{% endlilyaudio %}

## Some Boogie Woogie Bass Lines

{% lilyaudio 'inline', 'preview', '2.3 in', 'piano' %}
\score{
	\relative c, {
    \clef "bass_8"
    c8 c' e, f fis g g, g'
    c, c' e, f fis g g, g'
	}
	\layout{}
  \midi{\tempo 4 = 130}
}
{% endlilyaudio %}

{% lilyaudio 'inline', 'preview', '2.3 in', 'piano' %}
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
{% endlilyaudio %}

## And a Boogie Lick

{% lilyaudio 'inline', 'preview', '2.3 in', 'piano' %}
\score{
	\relative c'' {
    \clef "treble"
    c8 <dis fis> <e g> 
    c8 <dis fis> <e g> 
    c8 <dis fis> <e g> 
    c8 <dis fis> <e g> 
	}
	\layout{}
  \midi{\tempo 4 = 160}
}
{% endlilyaudio %}

## Put it together


{% lilyaudio 'inline', 'preview', '2.3 in', 'piano' %}

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
{% endlilyaudio %}

## And Our Good Friend Chopin

{% lilyaudio 'inline', 'preview', '2.3 in', 'piano' %}
rhMusic = \relative c'' {
  \new Voice {
    \set Score.tempoHideNote = ##t
    \tempo 4 = 60
    r2 c4.\( g8 |
    \once \override Tie.staff-position = #3.5
    bes1~ |
    \bar "||"
    \time 6/4
    \tempo 4 = 120
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
  \layout{}
  \midi{}
}
{% endlilyaudio %}

