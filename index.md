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
```ly
{% raw %}{% lilypond 'inline'|'img', 'preview'|'full', 'height' %}
//lilypond markup ...
{% endlilypond %}{% endraw %}
```

Here is a longer example. Notice how the 2<sup>nd</sup> parameter is marked 'full'. Lilypond will then render the image to the height specified in the 3<sup>rd</sup> parameter. If marked 'preview' the height parameter will be ignored.


```ly/0
{% raw %}{% lilypond 'inline', 'full', '2.3 in' %}
\score{
	\relative c' {
    \tempo 4 = 160
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
