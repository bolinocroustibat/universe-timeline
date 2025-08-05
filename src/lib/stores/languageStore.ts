import { writable } from 'svelte/store'
import type { SupportedLocales } from '$lib/types'

// Get initial language from localStorage or default to English
const getInitialLanguage = (): SupportedLocales => {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('language')
		if (saved === 'fr' || saved === 'en') {
			return saved
		}
	}
	return 'en'
}

// Create the language store
export const currentLanguage = writable<SupportedLocales>(getInitialLanguage())

// Subscribe to changes and save to localStorage
if (typeof window !== 'undefined') {
	currentLanguage.subscribe((language) => {
		localStorage.setItem('language', language)
	})
}

// Helper function to get flag emoji for a language
export function getLanguageFlag(language: SupportedLocales): string {
	switch (language) {
		case 'en':
			return '🇺🇸'
		case 'fr':
			return '🇫🇷'
		default:
			return '🇺🇸'
	}
}

// Helper function to get language name
export function getLanguageName(language: SupportedLocales): string {
	switch (language) {
		case 'en':
			return 'English'
		case 'fr':
			return 'Français'
		default:
			return 'English'
	}
} 