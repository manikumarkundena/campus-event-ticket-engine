async function main() {
  try {
    const res = await fetch('https://binaries.prisma.sh');
    console.log('PRISMA_CDN_STATUS:', res.status);
  } catch (err) {
    console.error('PRISMA_CDN_ERR:', err.message);
  }
}
main();
