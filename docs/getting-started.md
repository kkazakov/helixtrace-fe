# Getting Started with HelixTrace

Welcome to HelixTrace — a map-based tool for planning radio networks. This tutorial will walk you through everything you need to get up and running, from creating your account to analyzing the line of sight between locations.

---

## 1. What is HelixTrace?

HelixTrace helps you place radio equipment locations on a map and figure out whether two locations can "see" each other for a radio link. Hills, mountains, and other terrain features can block radio signals — HelixTrace traces the ground between your points and shows you the elevation profile, so you know at a glance if the path is clear or blocked.

You don't need any technical background. If you can read a map and click a button, you can use HelixTrace.

---

## 2. Creating an Account

When you first open HelixTrace, you'll see a sign-in page.

![Sign-in page]

To create a new account:

1. Click the **Register** link at the bottom of the form.
2. Enter your **email address**.
3. Choose a **password** and type it in.
4. Click the **Register** button.

If everything is correct, you'll be taken straight to the dashboard. You can now sign in with these same credentials whenever you return.

> **Forgot your password?** Reach out to your system administrator. HelixTrace does not yet include a self-service password reset.

---

## 3. The Dashboard Layout

After signing in, you'll see the main workspace divided into two areas:

### The Map (left side)

This is an interactive world map. You can:

- **Drag** to pan around
- **Scroll** to zoom in and out
- **Click** on the map to interact with it (which we'll cover shortly)

On your first visit, the map may try to center on your current location (if your browser allows it). Otherwise it starts over Sofia, Bulgaria.

### The Tools Panel (right side)

This narrow sidebar is your control center. From top to bottom:

| Section | What it shows |
|---|---|
| **Header** | The HelixTrace logo and a sun/moon icon for switching themes |
| **User info** | Your email address and a logout button |
| **Tools** | Four buttons for the main actions |

The four tool buttons are:

1. **Line of sight** — Analyze whether two or three points have a clear radio path
2. **Add point by click** — Drop new markers directly on the map
3. **Add by coordinates** — Place a marker by typing latitude/longitude numbers
4. **Find optimal placement** — *(Coming soon)*

---

## 4. Adding Points to the Map

Points are the locations on the map where you might place radio equipment — a tower, a repeater, or just a spot you want to remember.

### Adding by Clicking on the Map

1. In the tools panel, click **Add point by click**. The button highlights to show it's active.
2. Click anywhere on the map. A dialog box appears.
3. Fill in the details:
   - **Label** — Give the point a name (for example "Hilltop Tower" or "Downtown Office"). This is optional — you can leave it blank.
   - **Category** — Choose what kind of point it is:
     - *Point of interest* — A location you want to mark
     - *Repeater* — A relay station
     - *Unknown* — General purpose (the default)
   - **Public marker** — Check this box if you want other users to see this point. Leave it unchecked to keep it private (visible only to you).
4. Click **Save**. The point appears on the map as a colored pin.

The pin's color tells you its category and whether it's public or private:
- Blue (public) or purple (private) — Point of interest
- Green (public) or red (private) — Repeater
- Yellow (public) or orange (private) — Unknown

To cancel adding a point, click the **Cancel** button in the dialog, or click the tool button again (it changes to "Cancel" while active).

### Adding by Coordinates

If you already know the exact latitude and longitude:

1. Click **Add by coordinates** in the tools panel.
2. A dialog appears with the latitude and longitude of the **center of your current map view** pre-filled. You can type over these numbers.
3. Fill in the label, category, and public/private setting.
4. Click **Save**.

### Editing or Removing a Point

You can only edit or delete points that **you created**.

- **To see details:** Click a pin on the map. A popup appears showing its coordinates, elevation, category, and visibility.
- **To edit:** Click the pin, then click the edit icon (pencil) in the popup. Change any field and save.
- **To delete:** Click the pin, then click the trash icon. Confirm the removal.

---

## 5. Checking Line of Sight

This is HelixTrace's main feature — determining whether two (or three) locations have an unobstructed radio path.

### How It Works

HelixTrace traces the terrain between your selected points and builds an elevation profile — a graph showing the height of the ground along the path. It then checks whether the straight line between your points passes above the terrain (clear) or hits something (blocked).

### Step by Step

1. Click the **Line of sight** tool button. The button highlights, and the map cursor changes to a crosshair.
2. Click on the map to place your first point. A red temporary pin appears.
3. Click to place a second point. HelixTrace draws a line between the two and a small elevation graph appears in the tools panel.
4. (Optional) Click to place a third point. HelixTrace connects all three and shows three graphs — one for each pair.

### Reading the Results

Below the selected points, you'll see:

- **Distance** — The straight-line distance between your points (shown in kilometers or meters).
- **Elevation graphs** — Small charts showing the ground profile between each pair of points. A green horizontal line represents the radio beam. If the green line stays above the ground, the path is **clear**. If the ground crosses the green line, the path is **blocked**.
- **Click any graph** to enlarge it and see more detail.

The connecting line on the map is color-coded:
- **Green** — Clear line of sight
- **Red** — Blocked
- **Grey** — Could not determine

> **Tip:** You can drag the red temporary points around on the map to fine-tune their positions. The results update automatically.

### Removing Points from Analysis

To remove a point from the line of sight analysis, click the ✕ button next to its name in the tools panel, or click the pin on the map.

### Exiting Line of Sight Mode

Click the **Line of sight** button again to turn it off. The temporary points and lines disappear.

---

## 6. Customizing Your Experience

### Changing the Map Layer

HelixTrace offers multiple map styles to suit your needs:

| Layer | Best for |
|---|---|
| OpenStreetMap | General purpose street map |
| OpenTopoMap | Terrain and contour lines |
| Stamen Terrain | Shaded relief with terrain coloring |
| ESRI Satellite | Aerial imagery |
| CARTO Light | Clean, minimal light map |
| CARTO Dark | Clean, minimal dark map |

To switch layers, use the layer selector at the top-right corner of the map. The map updates immediately.

### Light and Dark Theme

Click the sun/moon icon in the top-right of the tools panel to switch between light and dark mode. Your preference is remembered — the next time you open HelixTrace, it will use the theme you last selected.

---

## Next Steps

You now know the basics of HelixTrace. Here are a few things you might want to explore next:

- Try placing points around your area of interest
- Run a **line of sight** check between a rooftop and a distant tower
- Switch between **satellite and terrain views** to see your points in different map contexts
- Mark frequently used locations as **public** so your team can see them

---

> **Need help?** Contact your system administrator or the HelixTrace support team.
