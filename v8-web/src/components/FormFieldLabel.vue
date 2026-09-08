<template>
  <span class="form-field-label">
    <span class="form-field-label__title">{{ title }}</span>
    <span v-if="desc" class="form-field-label__desc">{{ desc }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  desc?: string
}>()
</script>
