# Desejo Lascivo — Rebranding

Cópia completa da loja virtual **Desejo Lascivo Luxury Lingerie**
(`loja.desejolascivolingerie.com.br`, plataforma ViaShop Moda), capturada como base
para o trabalho de **rebranding da marca**.

## Estrutura

```
site/
├── index.html                  # Home renderizada
├── <produto>.html              # ~255 páginas de produto (ex.: 2207-conjunto-perola-1.html)
├── colecoes/                   # 11 páginas de coleção
├── categorias/                 # 17 páginas de categoria
├── institucional-*.html        # Páginas institucionais (quem somos, trocas etc.)
└── assets/
    ├── imagens.viashopmoda.com.br/
    │   └── upload/SaoPaulo_DesejoLascivo/   # TODAS as fotos: produtos, banners, logos
    │       ├── colecoes/                    # Fotos de produto (grandes + thumbs)
    │       ├── estampas/                    # Fotos de cores/estampas
    │       └── Principal/                   # Banners da home
    └── ...                                  # CSS, JS, fontes e libs da plataforma
```

- As páginas foram salvas **já renderizadas** (o conteúdo que a plataforma monta via
  JavaScript está congelado no HTML) e com os caminhos reescritos para arquivos locais —
  dá para navegar e editar offline.
- Cada foto de produto existe em tamanho grande e em miniatura (`thumb_*`).

## Como visualizar localmente

```bash
npx http-server site -p 8080
# abra http://localhost:8080
```

Funciona offline para navegação e leitura. Carrinho, login e busca dependem da API da
plataforma ViaShop e só funcionam no site ao vivo.

## Rebranding

O material de origem está congelado neste repositório. Próximos passos típicos:

1. Definir a nova identidade (nome, logo, paleta, tipografia, tom de voz).
2. Substituir logos e banners em `site/assets/.../upload/SaoPaulo_DesejoLascivo/`.
3. Ajustar textos e cores nas páginas HTML / CSS.
4. Levar o novo visual para a plataforma da loja.
