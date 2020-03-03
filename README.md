# NEO - Omnichannel commerce platform
![alt-text](https://img.shields.io/badge/version-2.71.25RC-orange.svg "Release Version")

Tema padrão para as novas lojas criadas na plataforma NEO.

*ASP.NET MVC Razor Theme Engine*

## Requisitos

- [Documentação Online](https://neohelp.readme.io/docs)

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

## Obtendo o Tema Default

Clone esse repositório e instale suas dependências:

```bash
git clone https://github.com/jetebusiness/NEO-Default_Theme.git
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

Nossos modelos e objetos são todos baseados nos retornos da API dos Micro-Serviços. Para obter uma lista atualizada acesse nossa documentação online de ajuda. (https://neohelp.readme.io/v1/reference)
