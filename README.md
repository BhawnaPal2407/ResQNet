# ResQNet — Frontend

A React + Vite + Tailwind implementation of the ResQNet UI (dark theme,
red accent, blood-drop brand mark) matching your provided mockups.

## Folder structure

```
src/
├── assets/
│   ├── images/     ← drop hero/section photos here
│   ├── logo/        ← drop your real ResQNet logo files here
│   └── 3d/           ← drop any 3D renders here
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Button.jsx
│   ├── EmergencyCard.jsx
│   └── BloodCard.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Home.jsx
│   ├── EmergencyRequest.jsx
│   ├── BloodDonors.jsx
│   ├── LiveMap.jsx
│   ├── Tracking.jsx
│   ├── Volunteers.jsx
│   ├── Profile.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── App.jsx      ← all routes are registered here
├── App.css      ← Tailwind + shared custom styles (blood-drop, glow, etc.)
└── main.jsx     ← app entry point, wraps App in <BrowserRouter>
```

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Where things live

- **Colors & fonts**: `tailwind.config.js` under `theme.extend.colors.rq`
  and `theme.extend.fontFamily`. Change the hex values there to re-theme
  the whole app in one place.
- **Routes**: `src/App.jsx`. Add a new page by creating the file in
  `src/pages`, importing it, and adding a `<Route>`.
- **Real photos/logo**: this build uses `lucide-react` icons and CSS
  gradients in place of the photography in your mockups (no image
  files were provided). Drop your real images into `src/assets/images`
  and your logo file into `src/assets/logo`, then swap the icon/gradient
  placeholders in `Landing.jsx`, `Login.jsx`, `Signup.jsx`, `Navbar.jsx`,
  and `Footer.jsx` for `<img>` tags pointing at them.
- **Live map**: `src/pages/LiveMap.jsx` currently renders a stylized
  placeholder grid with positioned pins so it doesn't need an API key.
  Swap the `map-surface` div for a real map (Google Maps or Mapbox GL)
  when you're ready — the `MARKERS` array is already shaped to map onto
  real markers.
- **Forms**: every form (`Login`, `Signup`, `EmergencyRequest`, `Contact`)
  currently just `console.log`s and navigates on submit. Replace the
  `handleSubmit` function in each with your real API call.

## Notes

- Auth/session state, and API calls are not wired up — this is UI only,
  ready for you to connect to your Spring Boot backend.
- `Home.jsx`, `Profile.jsx`, `EmergencyRequest.jsx` etc. use mock arrays
  (`DONORS`, `ACTIVE_REQUESTS`, `USER`, ...) at the top of the file —
  swap these for real fetch calls to your API.
