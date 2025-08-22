
'use client';

// The logic to redirect or show Setup is now handled in the RootLayout.
// This page component can be very simple.
export default function Home() {
    // The AppLayout in RootLayout will handle whether to show Setup or redirect to Dashboard.
    // So this component can effectively return null or a minimal loader,
    // as it will only be briefly rendered.
  return null;
}
