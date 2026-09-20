# Instagram Video Intelligence & Experimentation Engine

## Complete Product Specification for AI Tool Updating

**Version:** 1.0\
**Date:** September 20, 2026\
**Purpose:** Turn an AI video analyzer into a comprehensive Instagram
video intelligence, performance diagnosis, public-account audit, and
experimentation system.

------------------------------------------------------------------------

# 1. Product Vision

The tool must not behave like a generic "video quality grader."

Its job is to answer four questions:

1.  **Is this video likely to work on Instagram?**
2.  **Why is it likely to work or fail?**
3.  **What can we actually prove from the available evidence, and what
    are we only inferring?**
4.  **What should the creator test next?**

The system must distinguish between:

-   **Observed facts**
-   **Calculated metrics**
-   **Predictions**
-   **Inferences**
-   **Unknown/private metrics**

The tool should work in two major modes:

### Mode A --- Single Video Intelligence

Input: - Instagram Reel URL - or uploaded video

Available AI inputs: - full script - audio transcript - visual
description - scene descriptions - timing - on-screen text - audio
information - video metadata

Output: - performance-potential score - detailed diagnostic - predicted
retention behavior - hook analysis - narrative analysis - emotional
analysis - shareability - saveability - rewatchability - platform
execution - scene-level weaknesses - recommended edits - experiments to
run

### Mode B --- Public Instagram Account Audit

Input: - Instagram profile URL - publicly accessible Reel information

Output: - account baseline - recent performance - median performance -
performance outliers - content clusters - format analysis - hook
analysis - duration analysis - visible engagement analysis - public
performance proxies - account trends - winning and losing patterns -
content opportunities - experiment recommendations

------------------------------------------------------------------------

# 2. Core Product Principle

Do not reduce a video to one number.

A video score is useful only when the system explains:

-   what is strong
-   what is weak
-   where the weakness occurs
-   why it matters
-   how confident the system is
-   what should be changed
-   what experiment would validate the hypothesis

The main output should therefore look like:

``` text
Instagram Performance Potential: 82/100
Evidence Confidence: 78/100

Strongest dimension:
Shareability — 91/100

Weakest dimension:
Retention Structure — 68/100

Primary bottleneck:
The video takes 3.2 seconds to establish the main conflict.

Recommended experiment:
Start directly on the conflict and remove the setup.

Hypothesis:
Reducing time-to-conflict should improve early retention.

Success metric:
3-second retention.

Secondary metric:
Sends per reach.
```

------------------------------------------------------------------------

# 3. Important Analytical Limitation

The system must never pretend to know private Instagram Insights unless
the user supplies them.

Publicly observable information can include:

-   followers
-   views
-   likes
-   comments
-   visible shares where available
-   visible saves where available
-   posting date
-   video duration
-   captions
-   public content
-   public profile information

Private metrics may include:

-   actual reach
-   unique accounts reached
-   average watch time
-   total watch time
-   retention curve
-   completion rate
-   3-second retention
-   non-follower reach
-   profile visits attributed to a Reel
-   follows attributed to a Reel
-   sends/shares when not publicly visible
-   saves when not publicly visible
-   audience demographics

When private metrics are unavailable, use language such as:

-   "predicted"
-   "estimated"
-   "proxy"
-   "inferred"
-   "publicly observable evidence suggests"

Never present a proxy as the actual Instagram metric.

------------------------------------------------------------------------

# 4. Evidence Hierarchy

Every analytical claim should belong to one of four categories.

## 4.1 Observed

Directly available from the video or public page.

Examples:

-   Reel has 240,000 public views.
-   Video duration is 18 seconds.
-   The first spoken sentence begins at 0.8 seconds.
-   The video contains a visible watermark.
-   The account has 42,000 followers.

## 4.2 Calculated

Mathematically derived from observed information.

Examples:

-   240,000 views / 42,000 followers = 5.71x view-to-follower multiple.
-   Likes / views.
-   Comments / views.
-   Median Reel views.
-   Performance index relative to account median.

## 4.3 Predicted

AI/model judgment based on the content itself.

Examples:

-   predicted retention
-   predicted shareability
-   predicted rewatchability
-   predicted hook strength

## 4.4 Inferred

A conclusion supported by evidence but not directly observable.

Example:

"High view-to-follower multiples suggest substantial distribution beyond
the existing follower base."

Do not say:

"This Reel definitely reached 85% non-followers."

unless actual Insights data is available.

------------------------------------------------------------------------

# 5. Single Video Analysis Pipeline

The video engine should analyze the video in this order:

1.  Technical metadata
2.  Visual timeline
3.  Audio timeline
4.  Transcript
5.  Script structure
6.  Scene structure
7.  Hook
8.  Premise clarity
9.  Curiosity
10. Retention structure
11. Narrative progression
12. Emotional progression
13. Shareability
14. Saveability
15. Rewatchability
16. Originality
17. Platform-native execution
18. CTA
19. Loop potential
20. Weak moments
21. Strong moments
22. Performance prediction
23. Experiments

------------------------------------------------------------------------

# 6. Video Metadata

Extract where available:

-   width
-   height
-   aspect ratio
-   frame rate
-   duration
-   resolution
-   audio presence
-   subtitles
-   visible text
-   watermark
-   estimated cut count
-   scene count

Flag:

-   non-vertical format
-   low resolution
-   excessive compression
-   unreadable text
-   important elements outside safe zones
-   competitor/platform watermark
-   excessive intro/outro
-   black bars where undesirable

Technical quality should never dominate the final performance score.

------------------------------------------------------------------------

# 7. Hook Analysis

The hook is the opening attention mechanism.

Analyze:

-   first frame
-   first 0.5 seconds
-   first 1 second
-   first 1.5 seconds
-   first 3 seconds
-   first spoken words
-   first text
-   first visual action
-   first emotional signal
-   first unanswered question

Score:

### Hook Strength: 0--100

Evaluate:

-   immediacy
-   visual novelty
-   movement
-   curiosity
-   conflict
-   emotional stimulus
-   clarity
-   relevance
-   specificity
-   information gap

The system must answer:

> Why would a stranger stop scrolling?

------------------------------------------------------------------------

# 8. Hook Types

Classify one or more:

-   visual shock
-   curiosity
-   question
-   bold statement
-   conflict
-   surprise
-   transformation
-   mystery
-   emotional moment
-   humor
-   problem
-   result-first
-   cold open
-   character reaction
-   unusual visual
-   useful promise
-   controversy
-   story beginning

Report the primary hook type and secondary types.

------------------------------------------------------------------------

# 9. Information Gap / Curiosity

Measure the gap between:

**What the viewer knows**

and

**What the viewer wants to know.**

Examples:

-   Who is behind the door?
-   What will happen next?
-   Why did the character react?
-   How was this made?
-   What is the answer?
-   What happens after the reveal?

Score:

### Curiosity: 0--100

Also determine whether the curiosity is:

-   genuine
-   weak
-   confusing
-   misleading
-   bait-and-switch

------------------------------------------------------------------------

# 10. Premise Clarity

Ask:

> Can a cold viewer understand what this video is about without prior
> context?

Evaluate:

-   who
-   what
-   where
-   goal
-   conflict
-   promise
-   visual clarity
-   text clarity
-   audio clarity

Score:

### Clarity: 0--100

Flag:

-   unclear subject
-   unexplained references
-   excessive context
-   ambiguous purpose
-   confusing opening
-   text that requires too much reading

------------------------------------------------------------------------

# 11. Predicted Retention

Do not claim to know actual retention unless Instagram Insights are
supplied.

Instead calculate:

### Predicted Retention Potential: 0--100

Analyze:

-   hook
-   time-to-premise
-   time-to-conflict
-   information density
-   progression
-   escalation
-   scene changes
-   unanswered questions
-   emotional changes
-   payoff timing
-   ending strength
-   loop potential

------------------------------------------------------------------------

# 12. Predicted Retention Curve

Generate a hypothetical retention curve.

Example:

``` text
0 sec      100%
1 sec       95%
3 sec       88%
5 sec       82%
10 sec      76%
15 sec      71%
20 sec      68%
23 sec      51%
```

Label it:

> Predicted retention model --- not actual Instagram Insights data.

The model should also identify likely drop-off points.

------------------------------------------------------------------------

# 13. Retention Risk Detection

Flag:

-   slow opening
-   unnecessary introduction
-   repetitive information
-   static section
-   low visual change
-   no narrative progression
-   delayed payoff
-   predictable middle
-   excessive explanation
-   weak ending
-   confusing transition

Each risk should include:

-   timestamp
-   duration
-   reason
-   severity
-   suggested edit

------------------------------------------------------------------------

# 14. Dead Second Detector

Identify periods where no meaningful new information, emotion, visual
event, or narrative progression occurs.

Example:

``` text
Potential dead time:
08.2–10.7 seconds

Duration:
2.5 seconds

Severity:
Moderate

Reason:
Character moves through the environment without changing the situation.

Suggested edit:
Reduce to 0.8–1.2 seconds.
```

------------------------------------------------------------------------

# 15. Narrative Structure

Analyze:

-   setup
-   character
-   goal
-   conflict
-   escalation
-   complication
-   twist
-   reveal
-   climax
-   payoff
-   resolution
-   CTA
-   loop

Score:

### Story Strength: 0--100

For non-story videos, use an appropriate structure such as:

-   problem → solution
-   question → answer
-   claim → proof
-   before → after
-   mistake → correction
-   list
-   tutorial
-   demonstration
-   reaction

Do not penalize a video merely because it lacks traditional narrative
structure.

------------------------------------------------------------------------

# 16. Narrative Friction

Identify moments where the viewer's reason to continue becomes weaker.

Example:

``` text
Narrative friction:
07.4–11.6 seconds

Reason:
The viewer already understands the objective, but no new information or escalation occurs.

Risk:
High

Recommendation:
Compress this section or introduce a new complication.
```

------------------------------------------------------------------------

# 17. "Why Keep Watching?" Test

For every major section, identify the viewer's current reason to
continue.

Example:

``` text
0–3 sec:
What did he find?

3–7 sec:
Will he open it?

7–12 sec:
What's inside?

12–17 sec:
Why is he reacting this way?

17–20 sec:
How will this end?
```

If no compelling reason exists for a significant section, flag:

### Retention Risk

------------------------------------------------------------------------

# 18. Emotional Architecture

Track emotional state across time.

Example:

``` text
0–3 sec:
Curiosity

3–7 sec:
Confusion

7–12 sec:
Tension

12–17 sec:
Surprise

17–20 sec:
Humor

20–22 sec:
Satisfaction
```

Analyze:

-   emotional clarity
-   emotional progression
-   emotional volatility
-   escalation
-   payoff
-   mismatch between intended and perceived emotion

Score:

### Emotional Impact: 0--100

------------------------------------------------------------------------

# 19. Shareability

Shareability should be a major score.

Ask:

> Why would someone send this to another person?

Classify sharing motivation:

-   relatable
-   funny
-   surprising
-   useful
-   impressive
-   emotional
-   shocking
-   inspirational
-   controversial
-   identity-based
-   social relationship
-   "this is you"
-   "this is literally me"
-   practical utility
-   inside joke

Score:

### Shareability Potential: 0--100

The tool should explicitly state the most likely sharing reason.

------------------------------------------------------------------------

# 20. Saveability

Ask:

> Would someone want to keep this for later?

Strong save categories:

-   tutorial
-   reference
-   educational
-   checklist
-   recipe
-   process
-   inspiration
-   information
-   resource
-   visual reference

Score:

### Saveability Potential: 0--100

------------------------------------------------------------------------

# 21. Rewatchability

Analyze:

-   hidden details
-   dense information
-   visual complexity
-   fast delivery
-   surprise
-   ambiguous meaning
-   loop
-   satisfying movement
-   transformation
-   jokes
-   reveal
-   information requiring a second pass

Score:

### Rewatchability Potential: 0--100

------------------------------------------------------------------------

# 22. Loop Analysis

Determine whether:

-   ending naturally connects to beginning
-   final frame resembles opening
-   action continues across the loop
-   audio connects
-   ending creates another question
-   viewer may accidentally or intentionally rewatch

Score:

### Loop Potential: 0--100

A loop is not mandatory.

Do not penalize a video simply because it does not loop.

------------------------------------------------------------------------

# 23. Audio Analysis

Analyze:

### Speech

-   opening sentence
-   clarity
-   pace
-   pauses
-   filler words
-   information density
-   conversational quality
-   emotional delivery

### Music

-   presence
-   relevance
-   intensity
-   timing
-   emotional support

### Sound effects

-   timing
-   emphasis
-   synchronization

### Audio/Visual Sync

Determine whether important sounds correspond to important visual
moments.

Flag:

-   muffled dialogue
-   inconsistent volume
-   distracting music
-   unnecessary silence
-   poorly timed sound effects
-   audio competing with speech

Score:

### Audio Effectiveness: 0--100

Do not assume that every successful Reel requires trending audio.

------------------------------------------------------------------------

# 24. Script Analysis

Use the full script/transcript to identify:

-   hook
-   premise
-   promise
-   setup
-   context
-   conflict
-   escalation
-   information delivery
-   repetition
-   filler
-   payoff
-   CTA

Calculate:

-   words per second
-   information density
-   filler ratio
-   time-to-value
-   time-to-conflict
-   time-to-payoff

Flag sentences that can be removed without harming comprehension.

------------------------------------------------------------------------

# 25. Visual Analysis

Analyze:

-   composition
-   subject prominence
-   camera distance
-   camera movement
-   shot changes
-   visual novelty
-   facial expressions
-   gestures
-   environment
-   lighting
-   contrast
-   color readability
-   text
-   visual hierarchy
-   scene transitions

For AI-generated videos, also inspect:

-   character consistency
-   object consistency
-   anatomy issues
-   temporal artifacts
-   morphing
-   unnatural motion
-   continuity errors

These should be treated as execution issues, not automatically as
performance failures.

------------------------------------------------------------------------

# 26. Platform-Native Execution

Score:

### Platform Fit: 0--100

Evaluate:

-   vertical framing
-   mobile readability
-   safe zones
-   caption/text placement
-   visual scale
-   fast comprehension
-   opening speed
-   subtitles
-   audio
-   watermark
-   pacing
-   CTA
-   loop
-   visual density

Avoid making universal claims that a specific format guarantees reach.

------------------------------------------------------------------------

# 27. Originality

Analyze:

### Concept originality

Is the idea distinctive?

### Execution originality

Is the presentation distinctive?

### Visual originality

Does it have a recognizable visual identity?

### Format originality

Does the structure differ from common templates?

Score:

### Originality: 0--100

Important:

Originality is not automatically good.

An original video can still be confusing, boring, or irrelevant.

------------------------------------------------------------------------

# 28. CTA Analysis

Evaluate:

-   presence
-   timing
-   relevance
-   naturalness
-   friction
-   value exchange

Examples of actions:

-   follow
-   comment
-   share
-   save
-   visit profile
-   click
-   watch another video

Do not automatically reward a CTA.

A forced "follow for more" can be worse than a natural question.

------------------------------------------------------------------------

# 29. Main Performance Score

Recommended dimensions:

  Dimension               Weight
  --------------------- --------
  Hook / Attention            15
  Retention Structure         20
  Shareability                15
  Story / Structure           10
  Emotional Impact            10
  Clarity                      8
  Rewatchability               7
  Originality                  5
  Platform Execution           5
  Audio                        5

Total:

**100 points**

The weights can be adjusted by content type.

For example, an educational video can assign more weight to clarity and
saveability, while entertainment can assign more weight to retention,
emotion, and shareability.

------------------------------------------------------------------------

# 30. Three Primary Scores

Do not use only one overall score.

## 30.1 Performance Potential

How strong the video itself is likely to be on Instagram.

## 30.2 Growth Potential

How likely the content is to attract new viewers and turn interest into
account growth.

## 30.3 Experiment Value

How useful the video is for learning what the audience responds to.

Example:

``` text
Performance Potential: 82/100
Growth Potential: 74/100
Experiment Value: 91/100
Evidence Confidence: 78/100
```

------------------------------------------------------------------------

# 31. Experiment Value

Experiment Value should be high when:

-   the video has a clear hypothesis
-   one variable can be changed
-   the audience response can be measured
-   the video has both strengths and weaknesses
-   the result could teach the creator something

Example:

``` text
Experiment Value: 94/100

Reason:
Strong hook and shareability, but weak payoff.

Useful experiment:
Test whether a stronger final reveal improves completion and shares.
```

------------------------------------------------------------------------

# 32. External Instagram Account Audit

Input:

-   Instagram profile URL

Analyze as much public information as is legally and technically
available.

Do not claim access to private Insights.

------------------------------------------------------------------------

# 33. Account-Level Metrics

Collect where available:

-   follower count
-   number of analyzed Reels
-   posting frequency
-   views
-   likes
-   comments
-   public shares/saves where available
-   video duration
-   publication date
-   captions
-   content type

Calculate:

-   median views
-   mean views
-   view volatility
-   median likes
-   median comments
-   like/view ratio
-   comment/view ratio
-   view/follower multiple
-   performance index
-   breakout rate

------------------------------------------------------------------------

# 34. Median vs Average

Use the **median** as the primary baseline.

Reason:

Viral outliers can massively distort an average.

Report both:

``` text
Median views: 18,400
Average views: 76,200
```

The difference itself is informative.

A large average/median gap indicates high volatility or major breakout
videos.

------------------------------------------------------------------------

# 35. View-to-Follower Multiple

Formula:

``` text
View-to-Follower Multiple =
Views / Followers
```

Example:

``` text
240,000 views
42,000 followers

= 5.71x
```

Use this as a **public distribution proxy**, not as actual reach.

Do not call it "true reach."

It does not reveal:

-   unique viewers
-   non-follower percentage
-   repeat views
-   actual reach

------------------------------------------------------------------------

# 36. Performance Index

Formula:

``` text
Performance Index =
Reel Views / Account Median Reel Views
```

Example:

``` text
Account median = 20,000
Reel = 100,000

Performance Index = 5.0x
```

Suggested interpretation:

-   \<0.5x = weak
-   0.5--1x = below/around baseline
-   1--2x = good
-   2--5x = strong
-   5--10x = breakout
-   10x+ = exceptional

These are internal analytical categories, not official Instagram
benchmarks.

------------------------------------------------------------------------

# 37. Public Engagement Proxies

Calculate:

### Like/View Ratio

``` text
Likes / Views × 100
```

### Comment/View Ratio

``` text
Comments / Views × 100
```

### Visible Engagement/View

``` text
(Likes + Comments + Visible Shares + Visible Saves) / Views × 100
```

Only include metrics actually available.

Do not invent missing values.

------------------------------------------------------------------------

# 38. Do Not Use Universal Engagement Benchmarks as Rules

Avoid statements such as:

> "4--8% is always healthy."

Instead:

-   compare against the account's own history
-   compare against the same content cluster
-   compare against similar accounts when enough data exists
-   label external benchmarks as heuristics

------------------------------------------------------------------------

# 39. Comment Analysis

Analyze comments qualitatively.

Classify:

-   genuine conversation
-   questions
-   friend tags
-   emotional reactions
-   requests for part 2
-   disagreement
-   praise
-   confusion
-   spam
-   bots
-   self-promotion
-   generic emojis

A large comment count is not automatically positive.

High-quality conversations can be more informative than raw volume.

------------------------------------------------------------------------

# 40. Send/Share Proxy

Comments that tag friends can be a qualitative indicator of
shareability.

Examples:

-   "@friend you need this"
-   "this is literally you"
-   "we have to try this"
-   "look at this"

But do **not** claim that comment tags mathematically guarantee DM
shares.

Correct interpretation:

> "Friend-tagging behavior provides qualitative evidence of social
> shareability, but actual DM sends cannot be inferred with certainty."

If public send/share data is available, use it directly.

------------------------------------------------------------------------

# 41. Viral Outlier Analysis

Analyze the distribution of views.

A healthy account does not need every video to perform equally.

Look for:

-   flatline
-   moderate variation
-   high variation
-   occasional breakouts
-   repeated breakouts

A "spiky" distribution can indicate that some content is escaping the
account's baseline audience.

It does not, by itself, prove organic growth.

------------------------------------------------------------------------

# 42. Content Clustering

Automatically classify Reels into content groups.

Possible categories:

-   comedy
-   storytelling
-   education
-   tutorial
-   reaction
-   review
-   behind the scenes
-   lifestyle
-   animation
-   AI content
-   commentary
-   transformation
-   product
-   news
-   inspiration
-   challenge
-   trend
-   other

Calculate performance by cluster.

Example:

``` text
Story:
Median = 82K
Performance = 4.2x

Comedy:
Median = 31K
Performance = 1.6x

Tutorial:
Median = 19K
Performance = 1.0x
```

------------------------------------------------------------------------

# 43. Hook Clustering

Classify opening patterns:

-   question
-   conflict
-   visual reveal
-   bold statement
-   cold open
-   character reaction
-   transformation
-   result-first
-   mystery
-   direct promise
-   problem
-   humor

Compare each hook type to account baseline.

This reveals which opening strategies work best for that specific
account.

------------------------------------------------------------------------

# 44. Duration Analysis

Group videos into duration ranges:

-   0--10 seconds
-   10--20 seconds
-   20--30 seconds
-   30--45 seconds
-   45--60 seconds
-   60+ seconds

Calculate performance by duration range.

Do not conclude that shorter is universally better.

Report account-specific patterns.

------------------------------------------------------------------------

# 45. Format Analysis

Compare:

-   talking head
-   animation
-   cinematic
-   screen recording
-   POV
-   reaction
-   montage
-   text-led
-   tutorial
-   narrative
-   interview
-   product demo

Identify:

-   best format
-   worst format
-   most consistent format
-   highest breakout potential

------------------------------------------------------------------------

# 46. Trend Analysis

Analyze performance over time.

Classify:

### Growing

Performance is improving.

### Declining

Performance is weakening.

### Stable

Performance remains near baseline.

### Volatile

Large variation between posts.

### Format transition

Performance changes after a content/format shift.

------------------------------------------------------------------------

# 47. Winning Pattern Detection

The system should identify repeated characteristics among top-performing
videos.

Example:

``` text
Top 10% videos commonly have:

• cold-open hook
• 14–22 second duration
• character reaction in first 2 seconds
• conflict by second 4
• strong final reveal
• high friend-tag behavior
```

Do not claim causation.

Phrase as:

> "These characteristics are associated with stronger public performance
> in this account's observed sample."

------------------------------------------------------------------------

# 48. Losing Pattern Detection

Identify characteristics associated with weaker performance.

Example:

``` text
Bottom 10% commonly have:

• 3+ second introductions
• static first shot
• low visual change
• weak premise
• generic CTA
• payoff after the 25-second mark
```

Again, report association rather than proven causation.

------------------------------------------------------------------------

# 49. Account Health Report

Recommended structure:

``` text
ACCOUNT PERFORMANCE

Followers: 42.3K
Reels analyzed: 37
Median views: 18.4K
Average views: 76.2K
Median view/follower: 0.44x
Breakout rate: 13.5%
Performance volatility: High
Trend: Improving

Strongest format:
Storytelling

Strongest hook:
Cold open

Strongest duration:
14–22 seconds

Main weakness:
Long setup

Evidence confidence:
72%
```

------------------------------------------------------------------------

# 50. Video Report Structure

Every single-video report should contain:

## Summary

-   overall score
-   performance potential
-   growth potential
-   experiment value
-   confidence

## Strengths

Top 3--5 strengths.

## Weaknesses

Top 3--5 weaknesses.

## Timeline

Scene-by-scene analysis.

## Hook

Detailed hook analysis.

## Retention

Predicted retention and risk points.

## Story

Narrative structure.

## Emotion

Emotional journey.

## Shareability

Why someone would send it.

## Saveability

Why someone would save it.

## Rewatchability

Why someone would replay it.

## Audio

Speech, music, sound effects.

## Visuals

Composition and execution.

## Platform Fit

Instagram-native assessment.

## Editing Opportunities

Specific timestamps.

## Experiments

Prioritized tests.

------------------------------------------------------------------------

# 51. Recommended Final Output

Example:

``` text
INSTAGRAM VIDEO INTELLIGENCE REPORT

Overall Performance Potential
82/100

Growth Potential
74/100

Experiment Value
91/100

Evidence Confidence
78/100


TOP STRENGTH
Shareability — 91/100

The situation is highly relatable and creates a natural
reason to send the video to another person.


TOP WEAKNESS
Retention Structure — 68/100

The main conflict arrives too late.


HOOK
91/100

Type:
Cold-open visual conflict

Strength:
The viewer immediately sees an unusual situation.

Risk:
The first spoken sentence adds unnecessary context.


PREDICTED RETENTION

0–3s     Very strong
3–7s     Strong
7–11s    Moderate risk
11–17s   Strong
17–20s   Strong payoff


NARRATIVE

Setup: Strong
Goal: Clear
Conflict: Strong
Escalation: Moderate
Payoff: Strong
Loop: Moderate


SHAREABILITY
91/100

Primary reason:
"This is literally my friend."


SAVEABILITY
41/100

Low utility/reference value.


REWATCHABILITY
76/100

The final reveal may encourage a second viewing.


MAIN EDIT

Cut 2.1 seconds from 7.4–9.5s.

Move the character reaction earlier.


EXPERIMENT #1

Variable:
Hook speed

Control:
Current introduction

Variant:
Start directly on the conflict

Hypothesis:
Earlier conflict increases early retention.

Primary metric:
3-second retention

Secondary metric:
Sends per reach


EXPERIMENT #2

Variable:
Payoff strength

Control:
Current ending

Variant:
Add an unexpected final reveal

Hypothesis:
A stronger payoff increases completion,
rewatches, and shares.
```

------------------------------------------------------------------------

# 52. Experiment Engine

The system should automatically turn diagnoses into experiments.

Each experiment must include:

-   variable
-   control
-   variant
-   hypothesis
-   expected mechanism
-   primary metric
-   secondary metric
-   success criteria
-   confidence

Example:

``` text
EXPERIMENT

Variable:
Time-to-conflict

Control:
Conflict begins at 3.4 sec

Variant:
Conflict begins at 0.8 sec

Hypothesis:
Earlier conflict will improve early retention.

Primary metric:
3-second retention

Secondary:
Average watch time
Completion
Sends per reach

Success criterion:
Variant improves primary metric without
meaningfully reducing shares.
```

------------------------------------------------------------------------

# 53. Experiment Prioritization

Rank experiments by:

### Impact

How much could this change performance?

### Confidence

How strong is the evidence?

### Effort

How difficult is it to test?

Use:

``` text
Experiment Priority =
Expected Impact × Confidence / Effort
```

Use this only as an internal prioritization framework.

------------------------------------------------------------------------

# 54. Experimental Learning

If users upload multiple versions, compare them.

Track:

-   hook change
-   duration change
-   script change
-   visual change
-   ending change
-   CTA change
-   audio change

Then report:

``` text
LEARNING

The account's last 8 experiments suggest:

Cold-open hooks:
+27% median views

Question hooks:
+8% median views

Long introductions:
-19% median views
```

Use cautious language:

> "Observed association"

unless there is a controlled experiment.

------------------------------------------------------------------------

# 55. Creator-Specific Learning

The tool should eventually learn:

-   preferred audience
-   strongest formats
-   strongest hooks
-   strongest duration
-   strongest emotions
-   strongest topics
-   strongest CTA
-   strongest storytelling structure

This creates a personalized:

# Content Performance Profile

Example:

``` text
CREATOR CONTENT PROFILE

Best format:
Short narrative animation

Best duration:
15–23 seconds

Best hook:
Visual mystery

Best emotion:
Curiosity → surprise → humor

Best ending:
Unexpected reveal

Weakest pattern:
Long explanatory introductions
```

------------------------------------------------------------------------

# 56. Account Comparison

Allow users to compare multiple public accounts.

Example:

``` text
ACCOUNT A
Median views: 18K
Breakout rate: 8%

ACCOUNT B
Median views: 31K
Breakout rate: 17%

ACCOUNT C
Median views: 22K
Breakout rate: 24%
```

Then compare:

-   hooks
-   formats
-   duration
-   content categories
-   posting patterns
-   public engagement
-   outlier behavior

The system should answer:

> "What does Account C repeatedly do that Accounts A and B do not?"

------------------------------------------------------------------------

# 57. Competitor Content Gap

Identify topics/formats competitors perform well with that the user has
not tested.

Example:

``` text
CONTENT GAP

Competitors:
Story-based reveal videos

Median competitor performance:
3.4x baseline

Your account:
No comparable tests detected.

Suggested experiment:
Create a 15–20 second story with a
visual mystery and final reveal.
```

------------------------------------------------------------------------

# 58. Recommendation Quality Rules

Recommendations must be:

-   specific
-   actionable
-   measurable
-   tied to evidence
-   prioritized

Avoid:

> "Make it more engaging."

Prefer:

> "Move the reveal from 11.2 seconds to the first 3 seconds, then
> introduce a second unanswered question."

Avoid:

> "Improve the hook."

Prefer:

> "Replace the first 2.7 seconds of setup with the character's reaction
> shot."

------------------------------------------------------------------------

# 59. Avoid False Algorithm Claims

Never state:

-   "Instagram definitely rewards X"
-   "This guarantees viral reach"
-   "This will get pushed to Explore"
-   "The algorithm gives X points"
-   "This exact ratio guarantees success"

unless there is reliable evidence directly supporting the claim.

Use:

-   "associated with"
-   "likely"
-   "may"
-   "suggests"
-   "predicted"
-   "observed in this sample"

------------------------------------------------------------------------

# 60. Avoid Universal Benchmarks

Do not hard-code claims like:

-   every video should get 20% of followers
-   4--8% engagement is always healthy
-   100% view/follower means viral
-   50% always drop in the first 3 seconds
-   faces always improve retention by a fixed percentage

Use account-specific baselines whenever possible.

External benchmarks can be shown as heuristics only.

------------------------------------------------------------------------

# 61. Video Quality vs Performance

Maintain separate concepts.

### Technical Quality

-   resolution
-   audio
-   visual artifacts
-   editing
-   continuity

### Creative Quality

-   idea
-   hook
-   story
-   emotion
-   originality
-   payoff

### Platform Performance Potential

-   attention
-   retention
-   shareability
-   saveability
-   rewatchability
-   growth potential

A technically beautiful video can have poor performance potential.

A simple video can have excellent performance potential.

------------------------------------------------------------------------

# 62. AI-Generated Video Specific Analysis

Because the system may analyze AI-generated content, add:

### Character consistency

-   identity
-   facial proportions
-   clothing
-   hairstyle
-   body proportions

### Temporal consistency

-   hands
-   objects
-   faces
-   background
-   lighting
-   motion

### Visual storytelling

-   readable action
-   clear subject
-   understandable staging
-   camera distance
-   composition

### Artificiality

Do not automatically penalize stylized or obviously AI-generated
visuals.

Only penalize artifacts when they interfere with comprehension,
immersion, or perceived quality.

------------------------------------------------------------------------

# 63. Recommended Database/Data Model

For every analyzed video store:

``` text
video_id
source_url
account_id
date
duration
resolution
aspect_ratio

script
transcript
visual_description
audio_description

hook_type
hook_score
clarity_score
curiosity_score

retention_score
predicted_retention_curve

story_score
emotion_score
shareability_score
saveability_score
rewatchability_score
originality_score
platform_fit_score
audio_score

performance_potential
growth_potential
experiment_value
evidence_confidence

observed_metrics
calculated_metrics
inferences
unknown_metrics

scene_data[]
risk_points[]
strengths[]
weaknesses[]
experiments[]
```

------------------------------------------------------------------------

# 64. Scene Data Structure

Each scene should contain:

``` text
scene_id
start_time
end_time
duration

visual_description
audio_description
transcript

scene_function

hook_contribution
information_added
emotional_state
narrative_progression

retention_risk
retention_risk_score

shareability_contribution
payoff_contribution

edit_recommendation
```

------------------------------------------------------------------------

# 65. Account Data Structure

``` text
account_id
profile_url
followers
analysis_date

videos_analyzed

median_views
mean_views
median_likes
median_comments

view_volatility
breakout_rate
trend

content_clusters[]
hook_clusters[]
duration_clusters[]
format_clusters[]

winning_patterns[]
losing_patterns[]

public_metric_limitations[]
evidence_confidence
```

------------------------------------------------------------------------

# 66. API/AI Response Structure

Recommended top-level response:

``` json
{
  "overall": {
    "performance_potential": 82,
    "growth_potential": 74,
    "experiment_value": 91,
    "evidence_confidence": 78
  },
  "scores": {
    "hook": 91,
    "retention": 68,
    "shareability": 91,
    "story": 84,
    "emotion": 79,
    "clarity": 94,
    "rewatchability": 76,
    "originality": 82,
    "platform_fit": 90,
    "audio": 73
  },
  "evidence": {
    "observed": [],
    "calculated": [],
    "predicted": [],
    "inferred": [],
    "unknown": []
  },
  "timeline": [],
  "strengths": [],
  "weaknesses": [],
  "risk_points": [],
  "experiments": []
}
```

------------------------------------------------------------------------

# 67. Confidence System

Confidence should depend on evidence quality.

Example:

### High confidence

Video file + transcript + visual timeline + public metrics.

### Medium confidence

Video + transcript but limited visual analysis.

### Low confidence

Only public metadata.

### Very low confidence

Only views/followers/likes.

Confidence must decrease when important private metrics are missing.

------------------------------------------------------------------------

# 68. Public Account Audit Confidence

Example:

``` text
Evidence Confidence: 64%

Available:
✓ Followers
✓ Public views
✓ Likes
✓ Comments
✓ Posting dates
✓ Video duration

Unavailable:
✗ Reach
✗ Watch time
✗ Retention
✗ Sends
✗ Saves
✗ Follows per Reel
```

This is preferable to presenting a precise-looking score with weak
evidence.

------------------------------------------------------------------------

# 69. Account-Level Final Report

Recommended structure:

``` text
INSTAGRAM ACCOUNT INTELLIGENCE

ACCOUNT:
@creator

FOLLOWERS:
42.3K

REELS ANALYZED:
37

MEDIAN VIEWS:
18.4K

AVERAGE VIEWS:
76.2K

PERFORMANCE VOLATILITY:
High

TREND:
Improving

BREAKOUT RATE:
13.5%

EVIDENCE CONFIDENCE:
72%


BEST CONTENT CLUSTER:
Storytelling

BEST HOOK:
Cold open

BEST DURATION:
14–22 sec

BEST FORMAT:
Narrative animation


WINNING PATTERN:
Videos that begin directly inside a conflict
and end with an unexpected reveal significantly
outperform the account baseline.


LOSING PATTERN:
Videos with long introductions and delayed
conflict underperform the account baseline.


NEXT EXPERIMENT:
Create three videos using the winning structure
while changing only the topic.
```

------------------------------------------------------------------------

# 70. "Good vs Bad" Classification

The system can classify a video as:

### Exceptional

90--100

### Strong

80--89

### Good

70--79

### Mixed

60--69

### Weak

40--59

### Poor

0--39

But always show the component scores.

Never allow the label to replace the diagnosis.

------------------------------------------------------------------------

# 71. Final Recommendation Format

Every analysis should finish with:

## What to Keep

3--5 things.

## What to Change

3--5 things.

## What to Test Next

1--3 experiments.

## Biggest Bottleneck

One primary issue.

## Biggest Opportunity

One highest-upside improvement.

Example:

``` text
WHAT TO KEEP
• Strong visual opening
• Clear character reaction
• High shareability
• Strong final reveal

WHAT TO CHANGE
• Remove 2.1 sec of setup
• Introduce conflict earlier
• Simplify dialogue
• Strengthen final beat

BIGGEST BOTTLENECK
Middle-section retention.

BIGGEST OPPORTUNITY
Move the reveal earlier.

NEXT TEST
A/B test the first 3 seconds.
```

------------------------------------------------------------------------

# 72. Product Philosophy

The tool should encourage experimentation rather than certainty.

The correct mindset is:

``` text
Analyze
→ Form hypothesis
→ Create variation
→ Publish
→ Measure
→ Compare
→ Learn
→ Update model
→ Repeat
```

The tool should become more useful over time because it learns:

> "What works for this creator's audience?"

rather than endlessly repeating generic social-media advice.

------------------------------------------------------------------------

# 73. Ultimate Product Definition

The finished product should be understood as:

> **An AI-powered Instagram Video Intelligence and Experimentation
> Platform that analyzes individual videos and public Instagram
> accounts, separates observable evidence from prediction, diagnoses
> attention and retention mechanics, identifies creative strengths and
> weaknesses, discovers recurring winning patterns, and generates
> measurable experiments for improving future content.**

The product is not simply:

> "Is this video good?"

It is:

> **"Why might this video work, where might it fail, what evidence
> supports that conclusion, what can we learn from it, and what should
> we test next?"**

------------------------------------------------------------------------

# 74. Minimum Viable Feature Set

If implementation must be phased, build in this order.

## Phase 1 --- Single Video

1.  URL/video input
2.  transcript
3.  script analysis
4.  visual analysis
5.  scene segmentation
6.  hook score
7.  clarity score
8.  curiosity score
9.  retention prediction
10. story score
11. emotional score
12. shareability
13. saveability
14. rewatchability
15. platform fit
16. overall score
17. confidence
18. timestamped recommendations

## Phase 2 --- Public Account

1.  profile URL
2.  Reel collection
3.  public metrics
4.  median baseline
5.  performance index
6.  outlier detection
7.  content clusters
8.  hook clusters
9.  duration analysis
10. winning/losing patterns

## Phase 3 --- Experimentation

1.  experiment generator
2.  A/B hypothesis
3.  variable isolation
4.  experiment history
5.  results comparison
6.  creator-specific learning
7.  content recommendations

## Phase 4 --- Advanced Intelligence

1.  competitor comparison
2.  content gaps
3.  account trend detection
4.  creator performance profile
5.  predictive models trained on historical results
6.  personalized benchmarks
7.  automated experiment prioritization

------------------------------------------------------------------------

# 75. Non-Negotiable Rules

The AI must:

1.  Never pretend private Instagram metrics are known.
2.  Never call views "reach."
3.  Never claim a public proxy is the actual Instagram metric.
4.  Never treat one viral video as proof of a repeatable strategy.
5.  Never treat likes as the sole definition of success.
6.  Never assume shorter is always better.
7.  Never assume trending audio is required.
8.  Never assume a face guarantees retention.
9.  Never assume a loop is mandatory.
10. Never treat technical quality as equivalent to performance.
11. Always distinguish observation from inference.
12. Always provide actionable recommendations.
13. Always provide at least one experiment when enough evidence exists.
14. Prefer account-specific historical baselines over universal
    benchmarks.
15. State uncertainty when evidence is incomplete.
16. Never fabricate missing metrics.
17. Never guarantee virality.
18. Never claim causation from correlation without controlled evidence.
19. Use qualitative comment analysis rather than raw comment counts
    alone.
20. Treat the final score as a decision aid, not an absolute truth.

------------------------------------------------------------------------

# 76. Core Output Philosophy

Every report should make the creator feel:

> "I understand exactly why this video might work, exactly where it is
> weak, and exactly what I should try next."

Not:

> "The AI gave me 78/100."

The score is the summary.

The diagnosis is the product.

The experiment is the value.

The accumulated learning is the long-term advantage.
