// plugins/clarity.client.ts

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const clarityId = config.public.clarityId as string

  if (!clarityId) return  // no hace nada si no hay ID configurado

  // Inyectar el script de Clarity
  useHead({
    script: [
      {
        innerHTML: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityId}");
        `.replace('${clarityId}', clarityId),
        type: 'text/javascript'
      }
    ]
  })
})

