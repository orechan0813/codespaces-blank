"use client"

import { JazzProvider, useJazz } from "@/lib/jazz-store"
import { LoginScreen } from "@/components/jazz/login-screen"
import { AppShell } from "@/components/jazz/app-shell"
import { ToastHost } from "@/components/jazz/toast-host"

function Root() {
  const { currentUser } = useJazz()
  return (
    <>
      <ToastHost />
      {currentUser ? <AppShell /> : <LoginScreen />}
    </>
  )
}

export default function Page() {
  return (
    <JazzProvider>
      <Root />
    </JazzProvider>
  )
}
