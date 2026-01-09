'use server'

// Reading imports first...
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    //...
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error("Login Error:", error.message)
        let errorMessage = "Giriş yapılamadı."

        if (error.message.includes("Invalid login credentials")) {
            errorMessage = "Hatalı e-posta veya şifre."
        } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "Lütfen önce e-posta adresinizi doğrulayın."
        }

        return redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const origin = (await headers()).get('origin')
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: formData.get('fullName') as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.error("Signup Error:", error.message)
        return redirect(`/register?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect(`/login?message=${encodeURIComponent("Hesap oluşturuldu! Lütfen e-postanızı kontrol edin ve doğrulama linkine tıklayın.")}`)
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
