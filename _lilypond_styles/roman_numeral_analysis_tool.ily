\version "2.18"

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% A function to create Roman numerals for harmonic analysis.
%%
%% Syntax: \markup \rN { ...list of symbols... }
%%
%% List symbols in this order (as needed): Roman numeral (or note name),
%% quality, inversion figures from top to bottom, "/" (if a secondary
%% function), Roman numeral (or note name).  Usually, you can skip unnecessary
%% items, though a spacer may be needed in some cases.  Use "" instead of the
%% initial symbol to start with the quality or inversion, for example.  Elements
%% must be separated by whitespace.
%%
%% Notenames are represented by their English LilyPond names.  In addition, you
%% may capitalize the name for a capitalized note name.
%%
%% Preceding a string representing a Roman numeral with English alterations
%% (f, flat, s, sharp, ff, flatflat, ss, x, sharpsharp, natural)
%% will attach accidentals, for example, "fVII" -> flat VII; "sharpvi" -> sharp vi.
%% You may precede inversion numbers with alterations, though "+" is not
%% presently supported.
%%
%% Qualities: use "o" for diminished, "h" for half-diminished, "+" for augmented,
%% and "f" for flat.  Other indications are possible such as combinations of "M"
%% and "m" (M, m, MM7, Mm, mm, Mmm9, etc.); add, add6, etc.
%%
%% To scale all numerals: \override  LyricText #'font-size = #2
%% or \override  TextScript #'font-size = #2
%% To scale individual numerals: \markup \override #'(font-size . 2) \rN { ... }
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% THE APPROACH %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% In our approach, a Roman numeral consists of

%% 1. A "base".  OPTIONAL. This may be a Roman numeral (some combination of I, i, V,
%% and v, unenforced); a note name; or some other string.  Roman numerals may be
%% preceded by an accidental, and a note name may be followed by one.

%% 2. a quality indicator.  OPTIONAL.  Eventually, this will simply be something to
%% set as a superscript following the base, whether or not it is actually a
%% indicator of quality.

%% 3. A single inversion number, or more than one, to be set as a column.  OPTIONAL.
%% An initial accidental is supported.  (This will be extended to "anything you want
%% to appear in a column after the quality indicator.")

%% 4. "/" followed by a "secondary base" for indicating tonicization.  OPTIONAL.
%% As with 1. this may a Roman numeral or note name, and may include an accidental.

%% The input syntax is chosen to be friendly to the user rather than the computer.
%% In particular, the user usually need only type the symbols needed when
%% reading the analytical symbol aloud.  This is not perfect: spacers
%% may be necessary for omissions.  Additionally, we try to interpret symbols
%% without requiring extra semantic indicators: i.e., figure out whether a string
%% represents a Roman numeral or a note name without the user adding an extra sign.
%% In the future, indicators might prove necessary to resolve ambiguity: along with
%% a flag to distinguish Roman numeral from note name, braces to enclose inversion
%% figures may be useful.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% INPUT FORMATTING %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% The user's input is available as a list of strings.  Here we convert this
%% list into a nested list which describes the structure of the input.

#(define (split-list symbols splitter-list)
   "Split a list of strings by a splitter which is a member of a list of
potential splitters.  The splitter may be alone or part of a string.
input is split into
@code{(( ...strings up to splitter... ) ( ...strings beginning with splitter... ))}
This function is Used to split notation for secondary chords and to isolate
inversion numbers."
   (let loop ((sym symbols) (result '()))
     (cond
      ((or (null? sym)
           (find (lambda (y) (string-contains (car sym) y)) splitter-list))
       (list (reverse result) sym))
      (else (loop (cdr sym) (cons (car sym) result))))))

#(define numbers '("2" "3" "4" "5" "6" "7" "8" "9" "11" "13"))

#(define qualities
   ;; only to allow omission of base when quality is alone
   ;; TODO--combinations of M and m, add, ADD . . .
   '("o" "+" "h"))

#(define (base-and-quality arg)
   (let ((len (length arg)))
     (cond
      ((= 0 len) '(() ()))
      ((= 1 len)
       (if (find (lambda (y) (string= (car arg) y)) qualities)
           (list '() (list (car arg)))
           (list (list (car arg)) '()))) ;; TODO figure out which is given
      ((= 2 len) (list (list (car arg)) (cdr arg))))))

#(define (base-quality-figures symbols)
   ;; given (vii o 4 3) --> ((vii o) (4 3)) --> ((vii) (o) (4 3))
   ;; (4 3) --> (() (4 3)) --> (() () (4 3))
   ;; () --> (() ()) --> (() () ())
   (let* ((split-by-numbers (split-list symbols numbers))
          (b-and-q (base-and-quality (car split-by-numbers))))
     (append b-and-q (cdr split-by-numbers))))

#(define (parse-input input)
   (let (;; (vii o 4 3 / ii) --> ((vii o 4 3) (/ ii))
          (split (split-list input '("/"))))
     ;; --> ( ((vii) (o) (4 3)) (/ ii) )
     (append
      (list (base-quality-figures (car split)))
      (cdr split))))

%%%%%%%%%%%%%%%%%%%%%%%%%%%% NOTE NAMES / ACCIDENTALS %%%%%%%%%%%%%%%%%%%%%%%%%%

%% Formatting the input into interpretable lists continues here.  We are now
%% concerned with distinguishing Roman numerals from note names, and with representing
%% the presence and position of accidentals.

%% If a string belongs to the list of possible English notenames, we assume that
%% it is a note name.  The note name will be typeset as uppercase or lowercase depending
%% on the capitalization of the input string.

%% If a string is not a note name, we look for an alteration prefix, never a suffix.

%% The procedure parse-string-with-accidental breaks a string into a list representing
%% initial/terminal alterations and what is left.

%% Notenames and names of accidentals are based on English names.  Other
%% languages may be used by adding variables modeled after english-note names and
%% english-alterations, and changing the definitions of note names and alterations to
%% point to these new variables.

#(define english-note-names
   (map (lambda (p) (symbol->string (car p)))
     (assoc-get 'english language-pitch-names)))

#(define note-names english-note-names)

#(define (note-name? str)
   (let ((lowercased (format #f "~(~a~)" str)))
     (list? (member lowercased note-names))))

%% Groupings sharing an initial character are arranged in descending length so there
%% is no need to search for longest match in parse-string-with-accidental.
#(define english-alterations
   '("flatflat" "flat" "ff" "f"
      "sharpsharp" "sharp" "ss" "s" "x"
      "natural" "n"))

#(define alterations english-alterations)

#(define (parse-note-name str)
   "Given a note name, return a list consisting of the general name followed by
the alteration or @code{#f} if none."
   (let* ((first-char (string-take str 1))
          (all-but-first (string-drop str 1))
          (all-but-first (if (string-prefix? "-" all-but-first)
                             (string-drop all-but-first 1)
                             all-but-first))
          (all-but-first (if (string-null? all-but-first) #f all-but-first)))
     (list first-char all-but-first)))

#(define (parse-string-with-accidental str)
   "Given @var{str}, return a list in this format: (initial-accidental?
note-name-or-figure-or-RN terminal-accidental?) If an accidental is found, include
its string, otherwise @code{#t}."
   (if (not (string-null? str))
       (if (note-name? str)
           (cons #f (parse-note-name str))
           ;; Is it a Roman numeral or figure preceded (or followed) by an accidental?
           (let* ((accidental-prefix
                   (find (lambda (s) (string-prefix? s str)) alterations))
                  (accidental-suffix
                   (find (lambda (s) (string-suffix? s str)) alterations))
                  (rest (cond
                         (accidental-prefix
                          (string-drop str (string-length accidental-prefix)))
                         (accidental-suffix
                          (string-drop-right str (string-length accidental-suffix)))
                         (else str))))
             (list accidental-prefix rest accidental-suffix)))))
%{
#(define (inversion? str)
   "Check to see if a string contains a digit.  If so, it is an inversion figure."
   (not (char-set=
         char-set:empty
         (char-set-intersection (string->char-set str) char-set:digit))))
%}

%% We need to add extra space after certain characters in the default LilyPond
%% font to avoid overlaps with characters that follow.  Several of these kernings
%% don't seem to be necessary anymore, and have been commented out.
#(define (get-extra-kerning arg)
   (let ((last-char (string-take-right arg 1)))
     (cond
      ((string= last-char "V") 0.1)
      ((string= last-char "f") 0.2)
      ;((string= last-char "s") 0.2) ; sharp
      ;((string= last-char "x") 0.2) ; double-sharp
      ;((string= last-char "ss") 0.2) ; double-sharp
      (else 0.0))))

%% Create accidentals with appropriate vertical positioning.
#(define make-accidental-markup
   `(("f" . ,(make-general-align-markup Y DOWN (make-flat-markup)))
     ("flat" . ,(make-general-align-markup Y DOWN (make-flat-markup)))
     ("ff" . ,(make-general-align-markup Y DOWN (make-doubleflat-markup)))
     ("flatflat" . ,(make-general-align-markup Y DOWN (make-doubleflat-markup)))
     ("s" . ,(make-general-align-markup Y -0.6 (make-sharp-markup)))
     ("sharp" . ,(make-general-align-markup Y -0.6 (make-sharp-markup)))
     ("ss" . ,(make-general-align-markup Y DOWN (make-doublesharp-markup)))
     ("x" . ,(make-general-align-markup Y DOWN (make-doublesharp-markup)))
     ("sharpsharp" . ,(make-general-align-markup Y DOWN (make-doublesharp-markup)))
     ("n" . ,(make-general-align-markup Y -0.6 (make-natural-markup)))
     ("natural" . ,(make-general-align-markup Y -0.6 (make-natural-markup)))))

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% BASE MARKUP %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define (make-base-markup base scaling-factor)
   (let* ((base-list (parse-string-with-accidental base))
          (init-acc (first base-list))
          (end-acc (last base-list))
          (extra-space-right (get-extra-kerning (second base-list))))
     (cond
      (init-acc
       (make-concat-markup
        (list
         (make-fontsize-markup -3
           (assoc-ref make-accidental-markup init-acc))
         (make-hspace-markup (* 0.2 scaling-factor))
         (second base-list))))
      (end-acc
       (make-concat-markup
        (list
         (second base-list)
         (make-hspace-markup (* (+ 0.2 extra-space-right) scaling-factor))
         (make-fontsize-markup -3
           (assoc-ref make-accidental-markup end-acc)))))
      (else
       (if (> extra-space-right 0.0)
           (make-concat-markup
            (list
             base
             (make-hspace-markup (* extra-space-right scaling-factor))))
           base)))))

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% QUALITY %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Symbols representing diminished, half-diminished, and augmented qualities are
%% drawn to rest atop of baseline (alignment direction = DOWN), and moved by
%% make-quality-markup to their final vertical position.  They are tailored to
%% the font-size (-3) of the ultimate caller (\rN -- default font-size = 1).

%% These symbols are drawn from scratch to allow for customization.  should we
%% simply use symbols from a font?

#(define (make-diminished-markup font-size)
   "Create circle markup for diminished quality."
   (let* ((scaling-factor (magstep font-size))
          (r (* 0.48 scaling-factor))
          (th (* 0.1 scaling-factor)))
     (make-translate-markup
      (cons r r)
      (make-draw-circle-markup r th #f))))

#(define (make-half-diminished-markup font-size)
   "Create slashed circle markup for half-diminished quality."
   (let* ((scaling-factor (magstep font-size))
          (x (* 0.56 scaling-factor))
          (y (* 0.56 scaling-factor))
          (r (* 0.48 scaling-factor))
          (th (* 0.1 scaling-factor)))
     (make-translate-markup
      (cons x y)
      (make-combine-markup
       (make-draw-circle-markup r th #f)
       (make-override-markup `(thickness . ,scaling-factor)
         (make-combine-markup
          (make-draw-line-markup (cons (- x) (- y)))
          (make-draw-line-markup (cons x y))))))))

% Noticeably thinner than "+" from font -- change?
#(define (make-augmented-markup font-size)
   "Create cross markup for augmented quality."
   (let* ((scaling-factor (magstep font-size))
          (x (* 0.56 scaling-factor))
          (y (* 0.56 scaling-factor)))
     (make-override-markup `(thickness . ,scaling-factor)
       (make-translate-markup (cons x y)
         (make-combine-markup
          (make-combine-markup
           (make-draw-line-markup (cons (- x) 0))
           (make-draw-line-markup (cons 0 (- y))))
          (make-combine-markup
           (make-draw-line-markup (cons x 0))
           (make-draw-line-markup (cons 0 y))))))))

%% TODO: more "science" in the vertical position of quality markers.
#(define (make-quality-markup quality font-size offset)
   (cond
    ;; The quantity 'offset' by itself will cause symbol to rest on the midline.  We
    ;; enlarge offset so that the symbol will be more centered alongside a possible
    ;; figure.  (Topmost figure rests on midline.)
    ((string= quality "o") (make-raise-markup (* offset 1.25) (make-diminished-markup font-size)))
    ((string= quality "h") (make-raise-markup (* offset 1.25) (make-half-diminished-markup font-size)))
    ((string= quality "+") (make-raise-markup (* offset 1.25) (make-augmented-markup font-size)))
    (else (make-raise-markup offset (make-fontsize-markup font-size quality)))))

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% FIGURES %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define (make-figure-markup font-size)
   `(("f" . ,(make-general-align-markup Y DOWN
               (make-fontsize-markup font-size (make-flat-markup))))
     ("ff" . ,(make-general-align-markup Y DOWN
               (make-fontsize-markup font-size (make-doubleflat-markup))))
     ("flat" . ,(make-general-align-markup Y DOWN
                  (make-fontsize-markup font-size (make-flat-markup))))
     ("flatflat" . ,(make-general-align-markup Y DOWN
               (make-fontsize-markup font-size (make-doubleflat-markup))))
     ("s" . ,(make-general-align-markup Y -0.6
               (make-fontsize-markup font-size (make-sharp-markup))))
     ("x" . ,(make-general-align-markup Y -1.9
               (make-fontsize-markup font-size (make-doublesharp-markup))))
     ("ss" . ,(make-general-align-markup Y -1.9
               (make-fontsize-markup font-size (make-doublesharp-markup))))
     ("sharp" . ,(make-general-align-markup Y -0.6
                   (make-fontsize-markup font-size (make-sharp-markup))))
     ("sharpsharp" . ,(make-general-align-markup Y -1.9
               (make-fontsize-markup font-size (make-doublesharp-markup))))
     ("+" . ,(make-general-align-markup Y -1.5 (make-augmented-markup (+ font-size 2))))
     ("n" . ,(make-general-align-markup Y -0.6
               (make-fontsize-markup font-size (make-natural-markup))))
     ("natural" . ,(make-general-align-markup Y -0.6
                     (make-fontsize-markup font-size (make-natural-markup))))
     ))

#(use-modules (ice-9 regex))

#(define (hyphen-to-en-dash str)
   (string-regexp-substitute "-" "–" str))

%% Regular expression for splitting figure strings into words, digits, and connector characters.
#(define figure-regexp (make-regexp "[[:alpha:]]+|[[:digit:]]+|[^[:alnum:]]+"))

#(define (format-figures figures font-size)
   (let ((scaling-factor (magstep font-size)))
     (map (lambda (fig)
            (let* ((parsed-fig (map match:substring (list-matches figure-regexp fig)))
                   ;; Conversion causes character encoding problem with Frescobaldi
                   ;; if done before applying regexp
                   (parsed-fig (map hyphen-to-en-dash parsed-fig)))
              (reduce
               (lambda (elem prev) (make-concat-markup (list prev elem)))
               empty-markup
               (map (lambda (f)
                      (let ((alteration
                             (assoc-ref (make-figure-markup (- font-size 2)) f)))
                        (make-concat-markup
                         (list
                          (if alteration alteration (make-fontsize-markup font-size f))
                          ;; TODO: don't add space at the end
                          (make-hspace-markup (* 0.2 scaling-factor))))))
                 parsed-fig))))
       figures)))

#(define (make-figures-markup figures font-size offset)
   ;; Without offset the column of figures would be positioned such that the
   ;; topmost figure rests on the baseline. Adding offset causes the upper figure
   ;; to rest on the midline of base.
   (let ((formatted-figures (format-figures figures -3)))
     (make-override-markup `(baseline-skip . ,(* 1.4 (magstep font-size)))
       (make-raise-markup offset
         (make-right-column-markup formatted-figures)))))

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% SECONDARY RN %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define (make-secondary-markup second-part scaling-factor)
   (make-concat-markup
    (list
     (car second-part)
     (if (string-null? (cadr second-part))
         empty-markup
         (make-concat-markup
          (list
           (make-hspace-markup (* 0.2 scaling-factor))
           (if (car (parse-string-with-accidental (cadr second-part)))
               (make-hspace-markup (* 0.2 scaling-factor))
               empty-markup)
           (make-base-markup (cadr second-part) scaling-factor)))))))

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% SYNTHESIS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define-markup-command (rN layout props symbols) (markup-list?)
   #:properties ((font-size 1))
   "Create a symbol for Roman numeral analysis from a @var{symbols}, a list
of strings."
   (let* ((parsed-input (parse-input symbols))
          (first-part (car parsed-input))
          (second-part (cadr parsed-input)) ; slash and what follows
          (base (car first-part))
          (quality (cadr first-part))
          (figures (caddr first-part))
          ;; A multiplier for scaling quantities measured in staff-spaces to
          ;; reflect font-size delta.  Spacing between elements is currently
          ;; controlled by the magstep of the rN font-size.
          (scaling-factor (magstep font-size))
          (base-markup
           (if (or (null? base) (string-null? (car base))) ; "" used as spacer
               #f
               (make-base-markup (car base) scaling-factor)))
          ;; The height of figures and quality determined by midline of base.  If
          ;; there is no base, use forward slash as a representative character.
          (dy (* 0.5
                (interval-length
                 (ly:stencil-extent
                  (interpret-markup
                   layout props (if (markup? base-markup)
                                    base-markup "/"))
                  Y))))
          (quality-markup
           (if (null? quality)
               #f
               (make-concat-markup
                (list
                 (make-hspace-markup (* 0.1 scaling-factor))
                 (make-quality-markup (car quality) -3 dy)))))
          (figures-markup
           (if (null? figures)
               #f
               (make-concat-markup
                (list (make-hspace-markup (* 0.1 scaling-factor))
                  (make-figures-markup figures font-size dy)))))
          (secondary-markup
           (if (null? second-part)
               #f
               (make-concat-markup
                (list
                 (if (= (length figures) 1)
                     ;; allows slash to tuck under if single figure
                     (make-hspace-markup (* -0.2 scaling-factor))
                     ;; slightly more space given to slash
                     (make-hspace-markup (* 0.2 scaling-factor)))
                 (make-secondary-markup second-part scaling-factor)))))
          (visible-markups
           (filter markup?
                   (list base-markup quality-markup figures-markup secondary-markup))))

     (interpret-markup layout props
       (make-concat-markup visible-markups))))

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% KEY INDICATIONS %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define-markup-command (keyIndication layout props arg) (markup?)
   #:properties ((font-size 1))
   "Create a key indicator consisting of a English note name followed by a
colon.  Whitespace after the note name will be included in the returned markup."
   (let* ((scaling-factor (magstep font-size))
          (divide-at-spaces (string-match "([^[:space:]]+)([[:space:]]+)$" arg))
          (base (if divide-at-spaces
                    (match:substring divide-at-spaces 1)
                    arg))
          (trailing-spaces (if divide-at-spaces
                               (match:substring divide-at-spaces 2)
                               empty-markup)))
     (interpret-markup layout props
       (make-concat-markup
        (list
         (make-base-markup base scaling-factor)
         (make-hspace-markup (* 0.2 scaling-factor))
         ":"
         trailing-spaces)))))

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% SCALE DEGREES %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

#(define (parse-scale-degree str alteration-list)
   "Given @var{str}, return a list in this format: (name-of-alteration-or-#f degree)."
   (if (not (string-null? str))
       (let* ((alteration
               (find (lambda (s) (string-prefix? s str)) alteration-list))
              (rest (if alteration
                        (string-drop str (string-length alteration))
                        str)))
         (list alteration rest))))

#(define (hat font-size)
   "Draw a caret for use with scale degrees."
   (let* ((scaling-factor (magstep font-size))
          (x (* 0.25 scaling-factor))
          (y x)
          (th scaling-factor))
     (make-override-markup `(thickness . ,th)
       (make-combine-markup
        (make-draw-line-markup (cons x y))
        (make-translate-markup (cons x y)
          (make-draw-line-markup (cons x (- y))))))))

#(define-markup-command (scaleDegree layout props degree) (markup?)
   #:properties ((font-size 1))
   "Return a digit topped by a caret to represent a scale degree.  Alterations may
be added by prefacing @var{degree} with an English alteration."
   (let* ((scale-factor (magstep font-size))
          (caret (hat font-size))
          (degree-list (parse-scale-degree degree english-alterations))
          (alteration (car degree-list))
          (number (cadr degree-list))
          (alteration-markup (assoc-ref make-accidental-markup alteration))
          (alteration-markup
           (if alteration-markup
               (make-fontsize-markup -3 alteration-markup)
               alteration-markup))
          (number-and-caret
           (make-general-align-markup Y DOWN
             (make-override-markup `(baseline-skip . ,(* 1.7 scale-factor))
               (make-center-column-markup
                (list
                 caret
                 number))))))
     (interpret-markup layout props
       (if alteration-markup
           (make-concat-markup (list
                                alteration-markup
                                number-and-caret))
           number-and-caret))))
