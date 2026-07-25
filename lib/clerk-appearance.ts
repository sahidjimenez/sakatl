// Mismos design tokens que app/home.css / figma.md, para que los componentes
// de Clerk (SignIn, SignUp, UserButton, etc.) combinen con el resto de Sakatl.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#22c55e",
    colorBackground: "#1c2026",
    colorInputBackground: "#0d0f12",
    colorInputText: "#f1f3f4",
    colorText: "#f1f3f4",
    colorTextSecondary: "#9099a3",
    colorNeutral: "#9099a3",
    colorShimmer: "#2a2f37",
    borderRadius: "10px",
    fontFamily: "-apple-system, system-ui, sans-serif",
  },
  elements: {
    card: "bg-[#1c2026] border border-[#2a2f37] shadow-none",
    headerTitle: "text-[#f1f3f4]",
    headerSubtitle: "text-[#9099a3]",
    socialButtonsBlockButton: "border-[#2a2f37] bg-transparent text-[#f1f3f4] hover:bg-[#23272e]",
    socialButtonsBlockButtonText: "text-[#f1f3f4]",
    dividerLine: "bg-[#2a2f37]",
    dividerText: "text-[#6b7280]",
    formFieldLabel: "text-[#9099a3]",
    formFieldInput: "bg-[#0d0f12] border-[#2a2f37] text-[#f1f3f4] focus:border-[#4ade80]",
    formFieldInputShowPasswordButton: "text-[#9099a3]",
    formButtonPrimary: "bg-[#22c55e] text-[#08150d] hover:bg-[#22c55e]/90",
    footerActionText: "text-[#9099a3]",
    footerActionLink: "text-[#4ade80] hover:text-[#4ade80]",
    identityPreviewText: "text-[#f1f3f4]",
    identityPreviewEditButtonIcon: "text-[#4ade80]",
    footer: "bg-transparent",
  },
};
