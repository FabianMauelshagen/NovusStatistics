<template>
    <h1>{{ header }}</h1>
</template>

<script>
export default {
    props: ['header']
}
</script>

<style scoped>
h1 {
    padding-top: 10%;
    color: #343a40;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    font-size: 65px;
    font-weight: bold;
}
</style>