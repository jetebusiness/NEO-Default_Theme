# NEO - Omnichannel commerce platform
![alt-text](https://img.shields.io/badge/version-1.1RC-orange.svg "Release Version")

Tema padrão para as novas lojas criadas na plataforma NEO.

*ASP.NET MVC Razor Theme Engine*

## Requisitos

- [Node.JS](https://nodejs.org/en/) (v8.0+)
- [NPM](https://nodejs.org/en/)
- [Node-Gyp](https://github.com/nodejs/node-gyp)

##### Windows
- [Python](https://www.python.org/) (v2.7 *A versão 3.0 ainda não é suportada pelos compiladores*)
- [Windows-Build-Tools](https://github.com/felixrieseberg/windows-build-tools)

##### Mac OS
- [HomeBew](https://brew.sh/)
- Ruby
- Python
- [Xcode Command Line Tools](http://osxdaily.com/2014/02/12/install-command-line-tools-mac-os-x/)

##### Linux
- Python
- make
- [C/C++ compiler toolchain](https://gcc.gnu.org/)

## IDEs e Editores para Razor
### IDEs

- #### [Visual Studio](https://www.visualstudio.com)
MacOS e Windows

- #### [JetBrains Rider](https://www.jetbrains.com/rider)
Linux, MacOS e Windows

### Editores

- #### [Visual Studio Code](https://code.visualstudio.com)
Linux, MacOS e Windows

- #### [Sublime](https://www.sublimetext.com)
Linux, MacOS e Windows

- #### [Atom](https://atom.io)
Linux, MacOS e Windows

## Configurando Ambiente de Desenvolvimento
### Windows

1. Instale o Node.JS
2. Instale o Python com a opção de adicionar o Python ao PATH
3. Abra o terminal de comando (PowerShell modo Administrador) e execute o comando
```bash
npm install --global --production windows-build-tools
```

Com as instalações concluídas, reinicie o computador.

### MacOS

1. Instale o Node.JS
2. Instale o Xcode
3. No terminal execute o comando de instalação do Command Line Tools do Xcode
```bash
xcode-select --install
```
4. Instale o Node-Gyp

### Linux
1. Instale o Node.JS
2. Instale o Python
3. Instale o Node-Gyp

## Obtendo o Tema Default

Clone esse repositório e instale suas dependências:

```bash
git clone git@github.com:jetebusiness/NEO-Default_Theme.git
cd NEO-DefaultTheme
npm install
```

## Iniciando o Desenvolvimento

Dentro da pasta onde o *packages.json* encontra-se, execute o comando
```bash
npm run watch
```
Para iniciar o watcher/compiler dos resources.
Enquanto ele estiver ativo, toda vez que você salvar algum arquivo .js ou .scss dentro da pasta /resources ele automaticamente irá re-compilar o código.

## Compilando para produção

Dentro da pasta onde o *packages.json* encontra-se, execute o comando
```bash
npm run prod
```
Seu código dentro da pasta resources irá ser compilado para produção com minificação e uglifyJS.

## Modelos e Objetos

Nossos modelos e objetos são todos baseados nos retornos da API dos Micro-Serviços. Para obter uma lista atualizada e mais completa dos Objetos e Modelos acesse nossa documentação online de ajuda. (https://neohelp.readme.io/v1/reference)

## Estrutura de Arquvios

```bash
+---assets
|   \---image
|       |   email.svg
|       |   img_default.png
|       |   whats.jpg
|       |   
|       +---ads
|       |       autralis.png
|       |       camping.png
|       |       chromecast.png
|       |       diadosnamorados.png
|       |       galaxys8.png
|       |       imaginou.png
|       |       starwars.png
|       |       
|       +---banners
|       |       banner_chuteira.png
|       |       banner_motog.png
|       |       banner_notebook.png
|       |       
|       +---categorias
|       |       acessorios.png
|       |       chuteiras.png
|       |       eletrodomesticos.png
|       |       headphones.png
|       |       
|       +---checkout
|       |       jet_checkout.svg
|       |       logo-checkout.png
|       |       
|       +---logo
|       |       jet_logo_branco.png
|       |       logo.png
|       |       
|       +---marcas
|       |       beats.png
|       |       brastemp.png
|       |       gopro.png
|       |       lego.png
|       |       nike.png
|       |       samsung.png
|       |       
|       \---selos
|               clearsale.png
|               comodo.png
|               img_973.png
|               selo-clearsale.png
|               siteblindado.gif
|               site_blindado.png
|               
+---resources    
|   +---js       
|   |   |   app.js
|   |   |   bootstrap.js
|   |   |   plugins.js
|   |   |   routes.js
|   |   |   
|   |   +---api
|   |   |   |   api_config.js
|   |   |   |   _start.js
|   |   |   |   
|   |   |   +---checkout
|   |   |   |       cart.js
|   |   |   |       identification.js
|   |   |   |       mini_cart.js
|   |   |   |       payment.js
|   |   |   |       register.js
|   |   |   |       success.js
|   |   |   |       
|   |   |   +---customer
|   |   |   |       AccessKey.js
|   |   |   |       AddressManager.js
|   |   |   |       adressEdit.js
|   |   |   |       forgot.js
|   |   |   |       login.js
|   |   |   |       newsletter.js
|   |   |   |       register.js
|   |   |   |       
|   |   |   +---filter
|   |   |   |       filterManipulation.js
|   |   |   |       
|   |   |   +---order
|   |   |   |       orderDetail.js
|   |   |   |       
|   |   |   +---product
|   |   |   |       card.js
|   |   |   |       detail.js
|   |   |   |       
|   |   |   \---search
|   |   |           search.js
|   |   |           
|   |   +---functions
|   |   |       cart_manipulation.js
|   |   |       checkout.js
|   |   |       correios.js
|   |   |       cpfcnpj.js
|   |   |       filter.js
|   |   |       form-control.js
|   |   |       jetCheckout.js
|   |   |       jetCorreios.js
|   |   |       loading.js
|   |   |       menu.js
|   |   |       message.js
|   |   |       mini_cart_generic.js
|   |   |       mobile.js
|   |   |       modal.js
|   |   |       money.js
|   |   |       urlManipulation.js
|   |   |       zoom.js
|   |   |       
|   |   +---ui
|   |   |   |   _start.js
|   |   |   |   
|   |   |   +---modules
|   |   |   |       checkout.js
|   |   |   |       editCustomer.js
|   |   |   |       filters.js
|   |   |   |       floatingMenu.js
|   |   |   |       menu.js
|   |   |   |       mini_cart.js
|   |   |   |       product.js
|   |   |   |       product_details.js
|   |   |   |       register.js
|   |   |   |       review.js
|   |   |   |       slideshow.js
|   |   |   |       SocialNetwork.js
|   |   |   |       
|   |   |   \---starters
|   |   |           formManipulation.js
|   |   |           
|   |   \---vendors
|   |           semantic-ui.js
|   |           validators.js
|   |           
|   \---sass
|       |   style.scss
|       |   _semantic_ui.scss
|       |   _variables.scss
|       |   
|       +---default
|       |   |   theme.scss
|       |   |   
|       |   +---category
|       |   |       all.scss
|       |   |       _filter.scss
|       |   |       
|       |   +---checkout
|       |   |       all.scss
|       |   |       _cart.scss
|       |   |       _jetCheckout.scss
|       |   |       
|       |   +---client_area
|       |   |       all.scss
|       |   |       _form.scss
|       |   |       _menu.scss
|       |   |       
|       |   +---footer
|       |   |       all.scss
|       |   |       _footer.scss
|       |   |       _pagamento.scss
|       |   |       
|       |   +---header
|       |   |       all.scss
|       |   |       _header.scss
|       |   |       _topbar.scss
|       |   |       
|       |   +---helpers
|       |   |   |   all.scss
|       |   |   |   _background.scss
|       |   |   |   _display.scss
|       |   |   |   _margins.scss
|       |   |   |   
|       |   |   \---text
|       |   |           all.scss
|       |   |           _color.scss
|       |   |           _size.scss
|       |   |           _text.scss
|       |   |           
|       |   +---home
|       |   |       all.scss
|       |   |       _infobar.scss
|       |   |       _topseller.scss
|       |   |       
|       |   +---image
|       |   |       all.scss
|       |   |       _image.scss
|       |   |       
|       |   +---menu
|       |   |   |   all.scss
|       |   |   |   _menuHeader.scss
|       |   |   |   
|       |   |   \---wsmenu
|       |   |           _colors.scss
|       |   |           _mq.scss
|       |   |           _style.scss
|       |   |           
|       |   +---modification
|       |   |   |   all.scss
|       |   |   |   _mobile.scss
|       |   |   |   _semantic_ui.scss
|       |   |   |   
|       |   |   \---semantic_ui_mods
|       |   |           _border.scss
|       |   |           _breadcrumbs.scss
|       |   |           _buttons.scss
|       |   |           _card.scss
|       |   |           _divider.scss
|       |   |           _form.scss
|       |   |           _grid.scss
|       |   |           _input.scss
|       |   |           _mobile.scss
|       |   |           _positions.scss
|       |   |           _search.scss
|       |   |           _segment.scss
|       |   |           _sticky.scss
|       |   |           _tabs.scss
|       |   |           _tags.scss
|       |   |           _text.scss
|       |   |           
|       |   +---plugins
|       |   |       all.scss
|       |   |       _easyzoom.scss
|       |   |       _slickslider.scss
|       |   |       
|       |   +---product
|       |   |       all.scss
|       |   |       _floating_detail.scss
|       |   |       _parcelamento.scss
|       |   |       _product_card.scss
|       |   |       _product_detail.scss
|       |   |       _product_list.scss
|       |   |       _tag.scss
|       |   |       
|       |   \---variables
|       |       |   all.scss
|       |       |   _breakpoints.scss
|       |       |   _colors.scss
|       |       |   _menu_colors.scss
|       |       |   _semantic_ui.scss
|       |       |   _variables.scss
|       |       |   
|       |       \---semantic_ui_variables
|       |               _buttons.scss
|       |               _color.scss
|       |               _font.scss
|       |               
|       \---semantic-ui-calendar
|               _semantic-ui-calendar.scss
|               
+---SDK_NEO
|       SDK_Checkout.dll
|       SDK_Company.dll
|       SDK_Customer.dll
|       SDK_FraudProtection.dll
|       SDK_Order.dll
|       SDK_Payment.dll
|       SDK_Product.dll
|       SDK_SalesPromotion.dll
|       SDK_SocialNetwork.dll
|       
\---Views
    |   Web.config
    |   _ViewStart.cshtml
    |   
    +---Brand
    |       Index.cshtml
    |       
    +---Category
    |       Index.cshtml
    |       
    +---Checkout
    |       Checkout_Identification.cshtml
    |       Checkout_Register.cshtml
    |       Checkout_Success.cshtml
    |       Index.cshtml
    |       Payment.cshtml
    |       _GetShippingValues.cshtml
    |       _loadCart.cshtml
    |       _loadCartDetalhes.cshtml
    |       _loadMiniCart.cshtml
    |       
    +---Company
    |       _CommonQuestions.cshtml
    |       _EBit.cshtml
    |       
    +---Customer
    |       Accesskey.cshtml
    |       ChangeAddress.cshtml
    |       ChangeEmail.cshtml
    |       ChangePassword.cshtml
    |       ChangePasswordToken.cshtml
    |       CheckAccessKey.cshtml
    |       Contact.cshtml
    |       CreateAddress.cshtml
    |       Edit.cshtml
    |       EditAddress.cshtml
    |       FinishRegistration.cshtml
    |       Forgot.cshtml
    |       Index.cshtml
    |       Login.cshtml
    |       Register.cshtml
    |       _Address.cshtml
    |       
    +---Group
    |       Index.cshtml
    |       
    +---Home
    |       About.cshtml
    |       Contact.cshtml
    |       CustomPageView.cshtml
    |       Index.cshtml
    |       
    +---Order
    |       Details.cshtml
    |       Index.cshtml
    |       
    +---Product
    |   \---Details
    |           Details.cshtml
    |           _AlertMe.cshtml
    |           _AlsoPurchased.cshtml
    |           _BuyingTips.cshtml
    |           _BuyTogether.cshtml
    |           _FloatingBar.cshtml
    |           _FormAlertMe.cshtml
    |           _Gallery.cshtml
    |           _ItemsViewed.cshtml
    |           _Payment.cshtml
    |           _PaymentHide.cshtml
    |           _RelatedProducts.cshtml
    |           _Shipping.cshtml
    |           _Slide.cshtml
    |           _Variations.cshtml
    |           _VariationsCheckBox.cshtml
    |           _VariationsColor.cshtml
    |           _VariationsDropDown.cshtml
    |           _VariationsImage.cshtml
    |           
    +---Search
    |       Index.cshtml
    |       
    \---Shared
        |   404.cshtml
        |   500.cshtml
        |   Error.cshtml
        |   _Layout.cshtml
        |   
        +---Base
        |       _Layout.cshtml
        |       _LayoutBreadCrumb.cshtml
        |       _LayoutBreadCrumbContent.cshtml
        |       _LayoutBreadCrumbLeftSideBar.cshtml
        |       _LayoutCheckout.cshtml
        |       
        +---Blocks
        |   |   _InfoBar.cshtml
        |   |   
        |   +---Banner
        |   |       _BannerBrand.cshtml
        |   |       _BannerCategory.cshtml
        |   |       _CentralHalfBanner.cshtml
        |   |       _FooterHalfBanner.cshtml
        |   |       _FullBanner.cshtml
        |   |       _SideHalfBanner.cshtml
        |   |       
        |   +---Brand
        |   |       _Brands.cshtml
        |   |       _BrandsFilters.cshtml
        |   |       
        |   +---Category
        |   |       _CategoriesFilters.cshtml
        |   |       
        |   +---Group
        |   |       _GroupList.cshtml
        |   |       _Groups.cshtml
        |   |       
        |   \---Product
        |           _FeaturedProducts.cshtml
        |           _PriceFilters.cshtml
        |           _ProductList.cshtml
        |           _ProductsCategoryGrid.cshtml
        |           _ProductsCategoryList.cshtml
        |           _ReferencesFilters.cshtml
        |           _TopSellers.cshtml
        |           
        +---Common
        |       _Cart.cshtml
        |       _CartDetalhes.cshtml
        |       _CommonCss.cshtml
        |       _CommonJs.cshtml
        |       _CustomPages.cshtml
        |       _FilterMenu.cshtml
        |       _Footer.cshtml
        |       _Footer_Checkout.cshtml
        |       _Head.cshtml
        |       _Header.cshtml
        |       _JetLogo.cshtml
        |       _Menu.cshtml
        |       _Payments_List.cshtml
        |       _Seal.cshtml
        |       _SEO.cshtml
        |       _SocialBar.cshtml
        |       _TopBar.cshtml
        |       
        +---Object
        |   \---Product
        |           _ProductCartItem.cshtml
        |           _ProductCartItemDetalhes.cshtml
        |           _ProductcartItemMiniCart.cshtml
        |           _ProductInCard.cshtml
        |           _ProductInList.cshtml
        |           _ProductQuickView.cshtml
        |           
        \---Parts
            |   _Pagination.cshtml
            |   _PaginationOrder.cshtml
            |   
            +---Checkout
            |       _Part_Checkout_Address_Add.cshtml
            |       _Part_Checkout_Address_Manager.cshtml
            |       _Part_Checkout_Carrinho.cshtml
            |       _Part_Checkout_Desconto.cshtml
            |       _Part_Checkout_Frete.cshtml
            |       _Part_Checkout_Gateways.cshtml
            |       _Part_Checkout_Pagamento_Boleto.cshtml
            |       _Part_Checkout_Pagamento_Cartao.cshtml
            |       _Part_Checkout_Resumo.cshtml
            |       _Part_Checkout_Usuario.cshtml
            |       
            \---Customer
                    _Part_Customer_Login.cshtml
                    _Part_Customer_NewPassword.cshtml
                    _Part_Customer_Recive_Code.cshtml
```
