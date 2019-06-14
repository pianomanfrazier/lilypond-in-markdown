---
title: Lilypond & Audio in Markdown
date: 2019-06-14
layout: layouts/lilycode.njk
---

# LilyPond & Audio from Markdown

The audio generated is not web midi. The web midi has limited support so we will just use [howler.js](https://howlerjs.com/) to build a simple music player.

LilyPond can generate a midi file. The midi will then be processed to generate sound files. These sound files will be served up with each LilyPond snippet.

{% lilycode %}
\score{
	\relative c'' {
    g8 e \tuplet 3/2 { f[ a c] } e d a b c4
	}
	\layout{}
}
{% endlilycode %}

{% lilypond 'inline', 'preview', '0.7 in' %}
\score{
	\relative c'' {
    g8 e \tuplet 3/2 { f[ a c] } e d a b c4
	}
	\layout{}
}
{% endlilypond %}
