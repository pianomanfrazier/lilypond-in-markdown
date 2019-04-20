const htmlmin = require("html-minifier");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const MD5 = require("crypto-js/md5")
const fs = require('fs')
const { exec } = require('child_process')
const { svgo } = require("./LilypondExtension")

// Setup up typography
const Typography = require('typography');
const theme = require('typography-theme-lincoln');
// const theme = require('typography-theme-funston');
const typography = new Typography(theme);

// used to minify the svg output of Lilypond
const minifyHtml = (content) => htmlmin.minify(content, {
  useShortDoctype: true,
  removeComments: true,
  collapseWhitespace: true
});

module.exports = function(eleventyConfig) {

  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    init: function({ Prism }) {
      // TODO:
      //    embed scheme language inside lilypond
      //    implement tempo, fig bass, rhythm
      var re_identifier = /[^\W\d_]+([_-][^\W\d_]+)*/;
      var re_identifier_end = /(?![_-]?[^\W\d])/;
      var string = /(")(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

      // Bug in eleventy-syntax-highlight prevents multi-line elements
      // from displaying properly
      // see https://github.com/11ty/eleventy-plugin-syntaxhighlight/issues/12
      Prism.languages.lilypond = {
        'comment': [
          {
            'pattern': /(^|[^\%])\%\{[\s\S]*?(?:\%\}|$)/,
            'lookbehind': true,
          },
          {
            'pattern': /(^|[^\%:])\%.*/,
            'lookbehind': true,
            'greedy': true
          }
        ],
        'string': {
          'pattern': string,
          'greedy': true
        },
        'keyword': /([-_^](\s*))?\\(xNotesOn|xNotesOff|xNote|wordwrap-string-internal|wordwrap-string|wordwrap-lines|wordwrap-internal|wordwrap-field|wordwrap|withMusicProperty|with-url|with-link|with-dimensions|with-color|with|whiteout|whiteTriangleMarkup|walkerHeadsMinor|walkerHeads|vspace|void|voiceTwoStyle|voiceTwo|voiceThreeStyle|voiceThree|voiceOneStyle|voiceOne|voiceNeutralStyle|voiceFourStyle|voiceFour|vocalName|virgula|virga|verylongfermata|versus|version|verbatim-file|vcenter|varcoda|upright|upprall|upmordent|upbow|up|unset|unit|unfoldRepeats|underline|unaCorda|unHideNotes|typewriter|type|tweak|turn|tupletUp|tupletNeutral|tupletDown|tuplet|trill|triangle|treCorde|transposition|transposedCueDuring|transpose|transparent|translate-scaled|translate|topLevelAlignment|tocTitleMarkup|tocItemWithDotsMarkup|tocItemMarkup|tocItem|tiny|timing|times|timeSignatureSettings|timeSignatureFraction|time|tildeSymbol|tied-lyric|tieWaitForNote|tieUp|tieSolid|tieNeutral|tieHalfSolid|tieHalfDashed|tieDown|tieDotted|tieDashed|tieDashPattern|thumb|textSpannerUp|textSpannerNeutral|textSpannerDown|textLengthOn|textLengthOff|text|tenuto|tempoWholesPerMinute|tempo|teeny|tag|table-of-contents|tablatureFormat|tabStaffLineLayoutFunction|tabFullNotation|systemStartDelimiter|sustainOn|sustainOff|super|subdivideBeams|sub|styledNoteHeads|strut|stropha|strokeFingerOrientations|stringTunings|stringOneTopmost|stringNumberOrientations|stopped|stopTrillSpan|stopTextSpan|stopStaff|stopSlashedGraceMusic|stopGroup|stopGraceSlur|stopGraceMusic|stopAppoggiaturaMusic|stopAcciaccaturaMusic|stop|stencil|stemUp|stemNeutral|stemDown|startTrillSpan|startTextSpan|startStaff|startSlashedGraceMusic|startRepeatType|startGroup|startGraceSlur|startGraceMusic|startAppoggiaturaMusic|startAcciaccaturaMusic|start|staccato|staccatissimo|squashedPosition|spp|spacingTweaks|sp|southernHarmonyHeadsMinor|southernHarmonyHeads|sostenutoOn|sostenutoOff|soloText|soloIIText|snappizzicato|smaller|smallCaps|small|slurUp|slurSolid|slurNeutral|slurHalfSolid|slurHalfDashed|slurDown|slurDotted|slurDashed|slurDashPattern|slashedGrace|slashed-digit|slashChordSeparator|skipTypesetting|skip|simultaneous|simple|signumcongruentiae|showStaffSwitch|showSplitTiedTabNotes|shortfermata|shortVocalName|shortInstrumentName|shiftOnnn|shiftOnn|shiftOn|shiftOff|shiftDurations|sharp|shape|sfz|sfp|sff|sf|settingsFrom|setDefaultDurationToQuarter|set|sesquisharp|sesquiflat|sequential|semisharp|semiflat|semicirculus|semiGermanChords|segno|searchForVoice|scriptDefinitions|score|scaleDurations|scale|sans|sacredHarpHeadsMinor|sacredHarpHeads|rtoe|rounded-box|rotate|roman|rightHandFinger|right-column|right-brace|right-align|right|rheel|rfz|revertTimeSignatureSettings|revert|reverseturn|retrograde|restrainOpenStrings|rest|responsum|resetRelativeOctave|replace|repeatTie|repeatCountVisibility|repeat|removeWithTag|remove|relative|rehearsalMark|raise|quotedEventTypes|quotedCueEventTypes|quoteDuring|quilisma|put-adjacent|pushToTag|pt|property-recursive|printPartCombineTexts|printKeyCancellation|predefinedFretboardsOn|predefinedFretboardsOff|predefinedDiagramTable|prallup|prallprall|prallmordent|pralldown|prall|ppppp|pppp|ppp|pp|powerChords|powerChordSymbol|powerChordExceptions|postscript|portato|pointAndClickTypes|pointAndClickOn|pointAndClickOff|pitchedTrill|pipeSymbol|phrygian|phrasingSlurUp|phrasingSlurSolid|phrasingSlurNeutral|phrasingSlurHalfSolid|phrasingSlurHalfDashed|phrasingSlurDown|phrasingSlurDotted|phrasingSlurDashed|phrasingSlurDashPattern|pes|pedalUnaCordaStyle|pedalUnaCordaStrings|pedalSustainStyle|pedalSustainStrings|pedalSostenutoStyle|pedalSostenutoStrings|pattern|path|partialJazzMusic|partialJazzExceptions|partial|partcombineUp|partcombineUnisonoOnce|partcombineUnisono|partcombineSoloIOnce|partcombineSoloIIOnce|partcombineSoloII|partcombineSoloI|partcombineForce|partcombineDown|partcombineChordsOnce|partcombineChords|partcombineAutomaticOnce|partcombineAutomatic|partcombineApartOnce|partcombineApart|partcombine|partCombineTextsOnNote|partCombineListener|parenthesize|parenthesisOpenSymbol|parenthesisCloseSymbol|parallelMusic|paper|palmMuteOn|palmMuteOff|palmMute|pageTurn|pageBreak|page-ref|page-link|pad-x|pad-to-box|pad-markup|pad-around|p|omit|overrideTimeSignatureSettings|overrideProperty|override-lines|override|ottava|oriscus|open|oneVoice|once|on-the-fly|octaveCheck|numericTimeSignature|number|null|noteToFretFunction|note-by-number|note|normalsize|normal-text|normal-size-super|normal-size-sub|noPageTurn|noPageBreak|noChordSymbol|noBreak|noBeam|newSpacingSection|new|neumeDemoLayout|natural|name|musicglyph|musicMap|mp|mordent|modalTranspose|modalInversion|mm|mixolydian|minorChordModifier|minor|midiInstrument|midiChannelMapping|midi|middleCPosition|middleCClefPosition|mf|metronomeMarkFormatter|mergeDifferentlyHeadedOn|mergeDifferentlyHeadedOff|mergeDifferentlyDottedOn|mergeDifferentlyDottedOff|melismaEnd|melismaBusyProperties|melisma|medium|measureLength|maxima|markletter|markalphabet|markFormatter|markLengthOn|markLengthOff|mark|markLengthOn|markLengthOff|marcato|makeClusters|majorSevenSymbol|major|maininput|magnify|lyricMelismaAlignment|lydian|ltoe|lower|lookup|longfermata|longa|locrian|localKeySignature|lineprall|linea|line|ligature|lheel|left-column|left-brace|left-align|left|layout|larger|large|languageSaveAndChange|languageRestore|language|laissezVibrer|label|killCues|keyAlterationOrder|key|keepWithTag|keepAliveInterfaces|justify-string|justify-field|justify|justified-lines|italic|italianChords|ionian|inversion|interscoreline|instrumentTransposition|instrumentSwitch|instrumentName|instrumentEqualizer|indent|include|inclinatum|inStaffSegno|in|improvisationOn|improvisationOff|implicitTimeSignatureVisibility|ij|iij|ignoreFiguredBassRest|ignoreBarChecks|ignatzekExceptions|ignatzekExceptionMusic|ictus|huge|hspace|highStringOne|hideStaffSwitch|hideSplitTiedTabNotes|hideNotes|hide|header|hcenter-in|hbracket|harp-pedal|harmonicsOn|harmonicsOff|harmonicNote|harmonicByRatio|harmonicByFret|harmonicAccidentals|harmonic|handleNegativeFrets|halign|halfopen|grobdescriptions|graceSettings|grace|glissando|germanChords|general-align|fz|funkHeadsMinor|funkHeads|fullJazzExceptions|fromproperty|fret-diagram-verbose|fret-diagram-terse|fret-diagram|frenchChords|fraction|fp|footnote|fontsize|fontSize|fontCaps|flexa|flat|flageolet|firstClef|fingeringOrientations|finger|finalis|filled-box|fill-with-pattern|fill-line|figuredBassFormatter|fffff|ffff|fff|ff|fermataMarkup|fermata|featherDurations|f|eyeglasses|extraNatural|explicitKeySignatureVisibility|explicitCueClefVisibility|explicitClefVisibility|expandFullBarRests|eventChords|espressivo|escapedSmallerSymbol|escapedParenthesisOpenSymbol|escapedParenthesisCloseSymbol|escapedExclamationSymbol|escapedBiggerSymbol|epsfile|episemInitium|episemFinis|endincipit|enddim|enddecresc|enddecr|endcresc|endcr|endSpanners|endRepeatType|easyHeadsOn|easyHeadsOff|dynamicUp|dynamicNeutral|dynamicDown|dynamicAbsoluteVolumeFunction|dynamic|draw-dashed-line|draw-dotted-line|drumStyleTable|drumPitchTable|draw-line|draw-hline|draw-circle|downprall|downmordent|downbow|down|doublesharp|doubleflat|doubleRepeatType|dotsUp|dotsNeutral|dotsDown|dorian|divisioMinima|divisioMaxima|divisioMaior|displayMusic|displayLilyMusic|dir-column|dimTextDim|dimTextDecresc|dimTextDecr|dimHairpin|dim|description|descendens|deprecatedenddim|deprecatedendcresc|deprecateddim|deprecatedcresc|denies|deminutum|defaultchild|defaultTimeSignature|defaultNoteHeads|defaultBarType|default|decrescendoSpanner|decresc|decr|deadNotesOn|deadNotesOff|deadNote|dashUnderscore|dashPlus|dashLarger|dashHat|dashDot|dashDash|dashBar|cueDuringWithClef|cueDuring|cueClefUnset|cueClef|crossStaff|crescendoSpanner|crescTextCresc|crescHairpin|cresc|createSpacing|cr|context|consists|concat|compressFullBarRests|compoundMeter|command-name|combine|column-lines|column|coda|cm|clefPosition|clefOctavation|clefGlyph|clef|circulus|circle|chords|chordmodifiers|chordmode|chordRootNamer|chordPrefixSpacer|chordNoteNamer|chordNameSeparator|chordNameLowercaseMinor|chordNameFunction|chordNameExceptionsPartial|chordNameExceptionsFull|chordNameExceptions|char|change|center-column|center-align|center|cavum|caps|caesura|cadenzaOn|cadenzaOff|breve|breathe|breakDynamicSpan|break|bracketOpenSymbol|bracketCloseSymbol|bracket|box|bookpart|bookOutputSuffix|bookOutputName|book|bold|blackTriangleMarkup|bigger|bendAfter|beatStructure|beamHalfMeasure|beamExceptions|beam|bassStaffProperties|bassFigureStaffAlignmentUp|bassFigureStaffAlignmentNeutral|bassFigureStaffAlignmentDown|bassFigureExtendersOn|bassFigureExtendersOff|baseMoment|barNumberVisibility|barNumberFormatter|barNumberCheck|barCheckSynchronize|barAlways|bar|balloonText|balloonLengthOn|balloonLengthOff|balloonGrobText|backslashed-digit|automaticBars|absolute|autochange|autoCautionaries|autoBeaming|autoBeamOn|autoBeamOff|autoBeamCheck|autoAccidentals|auto-footnote|augmentum|auctum|assertBeamSlope|assertBeamQuant|ascendens|arrow-head|arpeggioParenthesisDashed|arpeggioParenthesis|arpeggioNormal|arpeggioBracket|arpeggioArrowUp|arpeggioArrowDown|arpeggio|appoggiatura|applyOutput|applyMusic|applyContext|appendToTag|alternative|alterBroken|allowPageTurn|alias|aikenHeadsMinor|aikenHeads|afterGraceFraction|afterGrace|aeolian|additionalPitchPrefix|addQuote|addInstrumentDefinition|accidentalStyle|acciaccatura|accepts|accentus|accent|abs-fontsize|aDueText|RemoveEmptyTabStaffContext|RemoveEmptyStaffContext|RemoveEmptyRhythmicStaffContext|RemoveEmptyDrumStaffContext|IJ|IIJ|single|EventClasses|C|B|AncientRemoveEmptyStaffContext|A|n)(?![a-zA-Z])/,
        'builtin': /\b(NullVoice|spacing|signature|routine|notes|handler|corrected|beams|arpeggios|Volta_engraver|Voice|Vertical_align_engraver|Vaticana_ligature_engraver|VaticanaVoice|VaticanaStaff|Tweak_engraver|Tuplet_engraver|Trill_spanner_engraver|Timing_translator|Time_signature_performer|Time_signature_engraver|Tie_performer|Tie_engraver|Text_spanner_engraver|Text_engraver|Tempo_performer|Tab_tie_follow_engraver|Tab_staff_symbol_engraver|Tab_note_heads_engraver|TabVoice|TabStaff|System_start_delimiter_engraver|Stem_engraver|Stanza_number_engraver|Stanza_number_align_engraver|Staff_symbol_engraver|Staff_performer|Staff_collecting_engraver|StaffGroup|Staff|Spanner_break_forbid_engraver|Span_bar_stub_engraver|Span_bar_engraver|Span_arpeggio_engraver|Spacing_engraver|Slur_performer|Slur_engraver|Slash_repeat_engraver|Separating_line_group_engraver|Script_row_engraver|Script_engraver|Script_column_engraver|Score|Rhythmic_column_engraver|RhythmicStaff|Rest_engraver|Rest_collision_engraver|Repeat_tie_engraver|Repeat_acknowledge_engraver|Pure_from_neighbor_engraver|Pitched_trill_engraver|Pitch_squash_engraver|Piano_pedal_performer|Piano_pedal_engraver|Piano_pedal_align_engraver|PianoStaff|Phrasing_slur_engraver|PetrucciVoice|PetrucciStaff|Percent_repeat_engraver|Part_combine_engraver|Parenthesis_engraver|Paper_column_engraver|Output_property_engraver|Ottava_spanner_engraver|Note_spacing_engraver|Note_performer|Note_name_engraver|Note_heads_engraver|Note_head_line_engraver|NoteNames|New_fingering_engraver|New_dynamic_engraver|Multi_measure_rest_engraver|Metronome_mark_engraver|Mensural_ligature_engraver|MensuralVoice|MensuralStaff|Mark_engraver|Lyrics|Lyric_performer|Lyric_engraver|Ligature_bracket_engraver|Ledger_line_engraver|Laissez_vibrer_engraver|KievanVoice|KievanStaff|Key_performer|Key_engraver|Keep_alive_together_engraver|Instrument_switch_engraver|Instrument_name_engraver|Hyphen_engraver|Hara_kiri_engraver|Grob_pq_engraver|GregorianTranscriptionVoice|GregorianTranscriptionStaff|GrandStaff|Grace_spacing_engraver|Grace_engraver|Grace_beam_engraver|Global|Glissando_engraver|Fretboard_engraver|FretBoards|Forbid_line_break_engraver|Footnote_engraver|Font_size_engraver|Fingering_engraver|Figured_bass_position_engraver|Figured_bass_engraver|FiguredBass|Extender_engraver|Episema_engraver|Dynamics|Dynamic_performer|Dynamic_align_engraver|Drum_notes_engraver|Drum_note_performer|DrumVoice|DrumStaff|Double_percent_repeat_engraver|Dots_engraver|Dot_column_engraver|Devnull|Default_bar_line_engraver|Custos_engraver|Cue_clef_engraver|CueVoice|Control_track_performer|Concurrent_hairpin_engraver|Collision_engraver|Cluster_spanner_engraver|Clef_engraver|Chord_tremolo_engraver|Chord_name_engraver|ChordNames|ChordNameVoice|ChoirStaff|Breathing_sign_engraver|Break_align_engraver|Bend_engraver|Beam_performer|Beam_engraver|Beam_collision_engraver|Bar_number_engraver|Bar_engraver|Axis_group_engraver|Auto_beam_engraver|Arpeggio_engraver|Accidental_engraver|Score|volta|unfold|percent|tremolo)\b/,
        'notechord': /\b((((solx|soltcs|soltcb|solstqt|solss|solsqt|solsd|solsb|sols|solkk|solk|soldsd|soldd|sold|solcs|solcb|solbtqt|solbsb|solbqt|solbb|solb|sol|six|sitcs|sitcb|sistqt|siss|sisqt|sisd|sisb|sis|sikk|sik|sidsd|sidd|sid|sics|sicb|sibtqt|sibsb|sibqt|sibb|sib|si|rex|retcs|retcb|restqt|ress|resqt|resd|resb|res|rekk|rek|redsd|redd|red|recs|recb|rebtqt|rebsb|rebqt|rebb|reb|re|mix|mitcs|mitcb|mistqt|miss|misqt|misd|misb|mis|mikk|mik|midsd|midd|mid|mics|micb|mibtqt|mibsb|mibqt|mibb|mib|mi|lax|latcs|latcb|lastqt|lass|lasqt|lasd|lasb|las|lakk|lak|ladsd|ladd|lad|lacs|lacb|labtqt|labsb|labqt|labb|lab|la|hississ|hiss|hisis|hisih|his|hih|hessess|heses|heseh|h|gx|gtqs|gtqf|gss|gsharpsharp|gsharp|gs|gqs|gqf|gississ|giss|gisis|gisih|gis|gih|gflatflat|gflat|gff|gf|gessess|gess|geses|geseh|ges|geh|g|fx|ftqs|ftqf|fss|fsharpsharp|fsharp|fs|fqs|fqf|fississ|fiss|fisis|fisih|fis|fih|fflatflat|fflat|fff|ff|fessess|fess|feses|feseh|fes|feh|fax|fatcs|fatcb|fastqt|fass|fasqt|fasd|fasb|fas|fakk|fak|fadsd|fadd|fad|facs|facb|fabtqt|fabsb|fabqt|fabb|fab|fa|f|ex|etqs|etqf|essess|ess|esharpsharp|esharp|eses|eseh|es|eqs|eqf|eississ|eiss|eisis|eisih|eis|eih|eflatflat|eflat|eff|ef|eessess|eess|eeses|eeseh|ees|eeh|e|dx|dtqs|dtqf|dss|dsharpsharp|dsharp|ds|dqs|dqf|dox|dotcs|dotcb|dostqt|doss|dosqt|dosd|dosb|dos|dokk|dok|dodsd|dodd|dod|docs|docb|dobtqt|dobsb|dobqt|dobb|dob|do|dississ|diss|disis|disih|dis|dih|dflatflat|dflat|dff|df|dessess|dess|deses|deseh|des|deh|d|cx|ctqs|ctqf|css|csharpsharp|csharp|cs|cqs|cqf|cississ|ciss|cisis|cisih|cis|cih|cflatflat|cflat|cff|cf|cessess|cess|ceses|ceseh|ces|ceh|c|bx|btqs|btqf|bss|bsharpsharp|bsharp|bs|bqs|bqf|bisis|bisih|bis|bih|bflatflat|bflat|bff|bf|bess|beses|beseh|bes|beh|bb|b|ax|atqs|atqf|assess|ass|asharpsharp|asharp|ases|aseh|asas|asah|as|aqs|aqf|aississ|aiss|aisis|aisih|ais|aih|aflatflat|aflat|aff|af|aessess|aess|aeses|aeseh|aes|aeh|a|a)(\s*[=]?\s*(([,]\s*)|([']\s*)){0,4}\s*[?!]?)?)|s|r|R|q)(?![A-Za-z])(\s*(128|64|32|16|8|4|2|1|\\breve|\\longa|\\maxima)(\s*[.]\s*)*((\s*\*\s*\d+(\/\d+)?)+)?)?(\s*[:](\s*(aug7|aug|dim|maj7|maj9|maj11|maj|m7\.5-|m7\+|m11|m9|m7|m6|m5|m|dim7|13\.11|13[-+]?|6[-+]?|9[-+]?|11[-+]?|sus2|sus4|sus|1[-+]?\.5[-+]?|1[-+]?\.5[-+]?\.8[-+]?|\d*[-+]?)((\s*[.]?\s*\d+[-+]?)|[-+])*)?)?(\s*\^\s*\d+(\s*\.\s*\d+)*)?(\s*\/[\+]?\s*(solx|soltcs|soltcb|solstqt|solss|solsqt|solsd|solsb|sols|solkk|solk|soldsd|soldd|sold|solcs|solcb|solbtqt|solbsb|solbqt|solbb|solb|sol|six|sitcs|sitcb|sistqt|siss|sisqt|sisd|sisb|sis|sikk|sik|sidsd|sidd|sid|sics|sicb|sibtqt|sibsb|sibqt|sibb|sib|si|rex|retcs|retcb|restqt|ress|resqt|resd|resb|res|rekk|rek|redsd|redd|red|recs|recb|rebtqt|rebsb|rebqt|rebb|reb|re|mix|mitcs|mitcb|mistqt|miss|misqt|misd|misb|mis|mikk|mik|midsd|midd|mid|mics|micb|mibtqt|mibsb|mibqt|mibb|mib|mi|lax|latcs|latcb|lastqt|lass|lasqt|lasd|lasb|las|lakk|lak|ladsd|ladd|lad|lacs|lacb|labtqt|labsb|labqt|labb|lab|la|hississ|hiss|hisis|hisih|his|hih|hessess|heses|heseh|h|gx|gtqs|gtqf|gss|gsharpsharp|gsharp|gs|gqs|gqf|gississ|giss|gisis|gisih|gis|gih|gflatflat|gflat|gff|gf|gessess|gess|geses|geseh|ges|geh|g|fx|ftqs|ftqf|fss|fsharpsharp|fsharp|fs|fqs|fqf|fississ|fiss|fisis|fisih|fis|fih|fflatflat|fflat|fff|ff|fessess|fess|feses|feseh|fes|feh|fax|fatcs|fatcb|fastqt|fass|fasqt|fasd|fasb|fas|fakk|fak|fadsd|fadd|fad|facs|facb|fabtqt|fabsb|fabqt|fabb|fab|fa|f|ex|etqs|etqf|essess|ess|esharpsharp|esharp|eses|eseh|es|eqs|eqf|eississ|eiss|eisis|eisih|eis|eih|eflatflat|eflat|eff|ef|eessess|eess|eeses|eeseh|ees|eeh|e|dx|dtqs|dtqf|dss|dsharpsharp|dsharp|ds|dqs|dqf|dox|dotcs|dotcb|dostqt|doss|dosqt|dosd|dosb|dos|dokk|dok|dodsd|dodd|dod|docs|docb|dobtqt|dobsb|dobqt|dobb|dob|do|dississ|diss|disis|disih|dis|dih|dflatflat|dflat|dff|df|dessess|dess|deses|deseh|des|deh|d|cx|ctqs|ctqf|css|csharpsharp|csharp|cs|cqs|cqf|cississ|ciss|cisis|cisih|cis|cih|cflatflat|cflat|cff|cf|cessess|cess|ceses|ceseh|ces|ceh|c|bx|btqs|btqf|bss|bsharpsharp|bsharp|bs|bqs|bqf|bisis|bisih|bis|bih|bflatflat|bflat|bff|bf|bess|beses|beseh|bes|beh|bb|b|ax|atqs|atqf|assess|ass|asharpsharp|asharp|ases|aseh|asas|asah|as|aqs|aqf|aississ|aiss|aisis|aisih|ais|aih|aflatflat|aflat|aff|af|aessess|aess|aeses|aeseh|aes|aeh|a|a))?)(?!(solx|soltcs|soltcb|solstqt|solss|solsqt|solsd|solsb|sols|solkk|solk|soldsd|soldd|sold|solcs|solcb|solbtqt|solbsb|solbqt|solbb|solb|sol|six|sitcs|sitcb|sistqt|siss|sisqt|sisd|sisb|sis|sikk|sik|sidsd|sidd|sid|sics|sicb|sibtqt|sibsb|sibqt|sibb|sib|si|rex|retcs|retcb|restqt|ress|resqt|resd|resb|res|rekk|rek|redsd|redd|red|recs|recb|rebtqt|rebsb|rebqt|rebb|reb|re|mix|mitcs|mitcb|mistqt|miss|misqt|misd|misb|mis|mikk|mik|midsd|midd|mid|mics|micb|mibtqt|mibsb|mibqt|mibb|mib|mi|lax|latcs|latcb|lastqt|lass|lasqt|lasd|lasb|las|lakk|lak|ladsd|ladd|lad|lacs|lacb|labtqt|labsb|labqt|labb|lab|la|hississ|hiss|hisis|hisih|his|hih|hessess|heses|heseh|h|gx|gtqs|gtqf|gss|gsharpsharp|gsharp|gs|gqs|gqf|gississ|giss|gisis|gisih|gis|gih|gflatflat|gflat|gff|gf|gessess|gess|geses|geseh|ges|geh|g|fx|ftqs|ftqf|fss|fsharpsharp|fsharp|fs|fqs|fqf|fississ|fiss|fisis|fisih|fis|fih|fflatflat|fflat|fff|ff|fessess|fess|feses|feseh|fes|feh|fax|fatcs|fatcb|fastqt|fass|fasqt|fasd|fasb|fas|fakk|fak|fadsd|fadd|fad|facs|facb|fabtqt|fabsb|fabqt|fabb|fab|fa|f|ex|etqs|etqf|essess|ess|esharpsharp|esharp|eses|eseh|es|eqs|eqf|eississ|eiss|eisis|eisih|eis|eih|eflatflat|eflat|eff|ef|eessess|eess|eeses|eeseh|ees|eeh|e|dx|dtqs|dtqf|dss|dsharpsharp|dsharp|ds|dqs|dqf|dox|dotcs|dotcb|dostqt|doss|dosqt|dosd|dosb|dos|dokk|dok|dodsd|dodd|dod|docs|docb|dobtqt|dobsb|dobqt|dobb|dob|do|dississ|diss|disis|disih|dis|dih|dflatflat|dflat|dff|df|dessess|dess|deses|deseh|des|deh|d|cx|ctqs|ctqf|css|csharpsharp|csharp|cs|cqs|cqf|cississ|ciss|cisis|cisih|cis|cih|cflatflat|cflat|cff|cf|cessess|cess|ceses|ceseh|ces|ceh|c|bx|btqs|btqf|bss|bsharpsharp|bsharp|bs|bqs|bqf|bisis|bisih|bis|bih|bflatflat|bflat|bff|bf|bess|beses|beseh|bes|beh|bb|b|ax|atqs|atqf|assess|ass|asharpsharp|asharp|ases|aseh|asas|asah|as|aqs|aqf|aississ|aiss|aisis|aisih|ais|aih|aflatflat|aflat|aff|af|aessess|aess|aeses|aeseh|aes|aeh|a|a))/,
        'timesig': /\d+\/\d+/,
        'tempo': /(128|64|32|16|8|4|2|1|\\breve|\\longa|\\maxima)(\s*[.]\s*)*=\s*\d+(\s*~\s*\d+)?/
      }
      Prism.languages.ly = Prism.languages.lilypond;
    }
  });

  // Inject the typography into the page
  // Typography bug: typography.toString() outputs default, not applied string
  // see https://github.com/KyleAMathews/typography.js/issues/205
  eleventyConfig.addShortcode('typography', () => {
    return `<style type="text/css">${typography.toString()}</style>`;
  });
  eleventyConfig.addShortcode("typographyFonts", () => {
    googleFonts = theme.default.googleFonts;
    let fonts = []
    for (let i in googleFonts) {
      let name = googleFonts[i].name.replace(/\s/g, "+");
      let tempString = `${name}:${googleFonts[i].styles.join(',')}`;
      fonts.push(tempString);
    }
    return `<link href="https://fonts.googleapis.com/css?family=${fonts.join('|')}" rel="stylesheet">`;
  });

  // The LilyPond Syntax highlihgt extension
  // pass source code to python-ly for syntax highlighting
  eleventyConfig.addNunjucksTag("lilycode", function(nunjucksEngine) {
    return new function() {
      this.tags = ['lilycode'];
      this.parse = function(parser, nodes, lexer) {
        var tok = parser.nextToken();
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);
        var body = parser.parseUntilBlocks('endlilycode');
        parser.advanceAfterBlockEnd();
        return new nodes.CallExtensionAsync(this, 'run', args, [body]);
      }
      this.run = function(context, body, callback) {
        let execString = `echo "${body().trim()}" | ly highlight -d full_html=false -d wrapper_tag=code -d document_id=language-lilypond`;
        exec(execString, function(err, stdout, stderr) {
          if(err) {
              console.error(err);
              return;
          }
          console.error(stderr);
          let formatedHtml = `<pre class="language-lilypond">${stdout}</pre>`;
          let ret = new nunjucksEngine.runtime.SafeString(formatedHtml);
          callback(null, ret);
        })
      }
    }
  })

  // The Lilypond extension
  eleventyConfig.addNunjucksTag("lilypond", function(nunjucksEngine) {
    return new function() {
      this.tags = ['lilypond'];
      this.parse = function(parser, nodes, lexer) {
          var tok = parser.nextToken();
          var args = parser.parseSignature(null, true);
          parser.advanceAfterBlockEnd(tok.value);
          var body = parser.parseUntilBlocks('endlilypond');
          parser.advanceAfterBlockEnd();
          return new nodes.CallExtensionAsync(this, 'run', args, [body]);
      };
      this.run = function(context, param, template, height, body, callback) {
          // get all files from _lilypond/*.ly and compare the hash
          // if not found then generate a new one
          let directory = `_lilypond`
          let tempString = `
          \\version "2.19"
          #(set! paper-alist (cons '("my size" . (cons (* 130 mm) (* ${height}))) paper-alist))

          \\paper {
              #(set-paper-size "my size")
              indent = 0\\mm
              line-width = 125\\mm
          }
          \\header {
            tagline = ##f %remove default Lilypond footer
          }

          ${body()}`
          let hash = MD5(tempString + template);
          let lilypondOpen = `<div class="lilypond">`;
          let lilypondClose = `</div>`
          let files = fs.readdirSync(`${directory}`);
          let isCached = false;
          for (var i in files) {
            if (files[i] === `${hash}.svg`) {
              isCached = true;
            }
          }
          if (isCached) {
            console.log(`Fetching ${hash} from the cache.`)
            if (param === 'inline') {
              fs.readFile(`${directory}/${hash}.min.preview.svg`, function(err, data) {
                  if(err) {
                      console.error(err);
                      return;
                  }
                  let ret = new nunjucksEngine.runtime.SafeString(minifyHtml(lilypondOpen + String(data) + lilypondClose));
                  callback(null, ret);
              })
            } else {
                let ret = new nunjucksEngine.runtime.SafeString(
                  minifyHtml(lilypondOpen + `<img src='/img/${hash}.svg' >` + lilypondClose)
                )
                callback(null, ret);
                return;
            }
          } else {
            fs.writeFile(`${directory}/${hash}.ly`, tempString, function(err) {
              if(err) {
                  console.error(err);
                  return;
              }
              exec(`lilypond -dpreview -dbackend=svg --output=${directory} ${directory}/${hash}.ly`, function (err, stdout, stderr) {
                  if (err) {
                      console.error(err);
                      return;
                  }
                  console.log(`stdout: ${stdout}`);
                  console.error(`stderr: ${stderr}`);

                  let filename = template === 'preview' ? `${directory}/${hash}.preview.svg` : `${directory}/${hash}.svg`;
                  fs.readFile(filename, function(err, data) {

                      if(err) {
                          console.error(err);
                          return;
                      }
                      //svg optimize
                      console.log('svg pre optimized length', data.length)
                      svgo.optimize(data, {path: `${directory}/${hash}.preview.svg`}).then(function(result) {
                          fs.writeFileSync(`${directory}/${hash}.min.preview.svg`, result.data);
                          console.log('svg post optimized length', result.data.length);
                          let ret = new nunjucksEngine.runtime.SafeString(
                            minifyHtml(lilypondOpen + `${result.data}` + lilypondClose)
                          )
                          if (param === 'inline') {
                            callback(null, ret);
                          } else {
                            fs.copyFileSync(`${directory}/${hash}.preview.svg`, `img/${hash}.svg`);
                            let ret = new nunjucksEngine.runtime.SafeString(
                              minifyHtml(lilypondOpen + `<img src='/img/${hash}.svg' >` + lilypondClose)
                            )
                            callback(null, ret);
                          }
                      });
                  })
              });
          });
          }
      };
    }
  })

  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let emoji = require("markdown-it-emoji");
  let options = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    xhtmlOut: true,
  };

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(emoji)
  );

  return {
    templateFormats: [
      "md",
      "njk",
      "html"
    ],

    pathPrefix: "/",

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
