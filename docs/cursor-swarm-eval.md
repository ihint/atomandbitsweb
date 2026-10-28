# Cursor swarm evaluation

Date: October 27, 2026.
Goal: make the existing navy, white and Tennessee-orange homepage feel playful and curious through a small interactive problem-solving scene.
Source: Ian's request and the live homepage at main 9253752; current approved copy and design stay the baseline.

Before implementation, expected behavior:
- The original particle field remains quiet at rest. In the illustration area, cursor movement gathers a small group, explores a network and resolves a path to the nearest node after a short pause.
- A visible button offers the same discovery by tap or keyboard. Native cursor, scrolling, links and text selection keep working.
- Motion never covers the main copy or blocks the CTA. Small screens retain readable copy and a usable control.
- Pause, reduced-motion preference, offscreen and hidden-tab states stop all animation work. Reduced motion shows a static solved scene; no canvas or no JavaScript leaves usable content.
- Source checks cover path convergence, changed targets, keyboard/tap trigger, motion lifecycle and pointer exit. Browser checks cover the real visual response, pause, CTA, phone layout and errors.
- Preserve all names, metrics, links and substantive copy. No new clinical or commercial claims.
- The first delivery is a private Tailscale preview with reviewed screenshots and a draft PR. Voice judgments are author interpretation until Ian reviews the result.

Critical failures: content obstruction, motion despite reduced preference or pause, broken navigation, unbounded animation loops, altered claims, or claiming the preview is deployed.

## Review and result

The live homepage was captured and inspected before implementation. Author judgment: the human examples, shared building language and invitation already communicate kindness, curiosity and openness. Navy, white, orange and large type communicate strength. Joy is stated in the copy; play and fun are less apparent in the passive sphere. This pass makes the visual respond without rewriting the approved voice.

1. Existing desktop hero: readable, strong and welcoming; its passive particle field gives little feedback to the visitor.
2. New cursor/button interaction: dots gather into a network, then trace an actual shortest route to the selected node. Button results stay visible; moving the pointer chooses another destination. The CTA and copy remain clear.
3. Phone layout and controls: the illustration moves below the copy. The button has a 44px target. The menu opens and Escape closes it; the main CTA opens the contact page.

Verification: 38 automated tests pass, including ten motion lifecycle and interaction cases. They cover connected routes, changed destinations, touch-scroll isolation, stable button results, pause, offscreen/hidden-tab suspension, missing canvas and reduced-motion changes. The first regression run caught a previously removed diagonal-arrow glyph; it was replaced with the existing arrow convention. Review found and fixed the transition from manual pause to a static reduced-motion route.

Browser checks used the exact private Tailscale URL. Desktop 1280px and phone 390px have no horizontal overflow. Pointer input and keyboard activation were exercised. Two screenshots taken apart while paused are byte-identical. No page console errors were recorded. The original homepage markup is byte-identical after removing the new control block, so all original names, claims, numbers, links and qualifiers remain intact. JavaScript syntax and whitespace checks pass.

Limits: phone checks used a narrow desktop browser viewport, not a physical touchscreen. Reduced-motion preference changes and offscreen suspension were tested with the browser-API harness, not a real OS setting change. No-JavaScript content is preserved by source review; a disabled-script browser session was not run. The local preview is static; no contact message was sent. This is author design review, not visitor research or Ian's approval. No merge or production deployment is part of this pass.

## Additional waypoints and arrival light

October 27 follow-up: Ian called the preview fun and requested a few more waypoints and stronger light when the path reaches its final dot. Before editing: extend the network by two columns, illuminate intermediate points as the route reaches them, and ease a soft orange halo and white center into the destination only after arrival. Preserve pause, static reduced motion, pointer and keyboard behavior. Check arrival timing and target reset in the canvas harness, inspect desktop and phone previews, and keep this in draft PR 74.

Result: the network now has 40 points, up from 30. Cross-network button routes traverse at least seven segments. Reached waypoints light in order, and the final node gains a soft orange halo with a white center over 0.8 seconds after arrival. The glow stays steady and resets for a new target. All 40 tests pass, including two new checks for arrival timing, reset and the static reduced-motion result. Desktop and 390px phone previews were inspected; the phone has no horizontal overflow and the glow fits the illustration. No browser errors were recorded. Existing physical-device and OS-preference test limits still apply.
