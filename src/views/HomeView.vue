<script setup>
import { nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ScrollTrigger } from '@/lib/gsap'
import HeroSection from '@/components/HeroSection.vue'
import ProjectsRail from '@/components/ProjectsRail.vue'
import AboutSection from '@/components/AboutSection.vue'
import ArchiveGrid from '@/components/ArchiveGrid.vue'
import StackMarquee from '@/components/StackMarquee.vue'
import TimelineSection from '@/components/TimelineSection.vue'
import ContactSection from '@/components/ContactSection.vue'

const { locale } = useI18n()
// Seções com SplitText são remontadas (:key) ao trocar de idioma para refazer a divisão do texto.
watch(locale, async () => { await nextTick(); ScrollTrigger.refresh() })
</script>

<template>
  <div class="home">
    <HeroSection />
    <ProjectsRail :key="`rail-${locale}`" />
    <AboutSection :key="`about-${locale}`" />
    <ArchiveGrid />
    <StackMarquee />
    <TimelineSection :key="`tl-${locale}`" />
    <ContactSection :key="`contact-${locale}`" />
  </div>
</template>
