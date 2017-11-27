// @flow
import * as Utils from "./utils/Utils";
import * as ErroHandler from "./utils/ErrorHandler";
import {LOCAL} from "./Store";
import EError from "./utils/EError";

export const PROCESS_ENV = process && process.env ? process && process.env : {};
export const DEV_MODE = PROCESS_ENV.NODE_ENV === 'development' || PROCESS_ENV.NODE_ENV === 'dev';
export const PROD_MODE = PROCESS_ENV.NODE_ENV === 'production';
export const DEMO_MODE = PROCESS_ENV.NODE_ENV === 'demo';
export const TEST_MODE = PROCESS_ENV.NODE_ENV === 'test';

export const DEBUG_MODE = !!LOCAL.get("$DebugMode$");

window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.ctrlKey && e.altKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        if (DEBUG_MODE) LOCAL.remove("$DebugMode$"); else LOCAL.set("$DebugMode$", true);
        window.location.reload();
    }
});

/** Lista obiektów typu MenuItem */


export default class Dev {

    static TOOLS = [];

    static OCCUPATIONS = ["Grafik", "Pracownik biurowy", "Urzędnik państwowy", "Lekarz", "Specjalista ds. zakupów",
        "Specjalista ds. PR", "Programista", "Architekt wnętrz / krajobrazu", "Ekonomista", "Specjalista ds. marketingu",
        "Programista baz danych", "Prawnik", "Inżynier Środowiska", "Webmaster", "Specjalista ds. ochrony środowiska",
        "Automatyk", "Projektant wzornictwa", "Laborant", "Specjalista ds. transportu", "Tester aplikacji",
        "Dyrektor ds.Administracyjnych", "Dietetyk", "Koordynator robót budowlanych", "Specjalista ds. turystyki",
        "Spedytor", "Pedagog", "Specjalista ds. BHP", "Koordynator sprzedaży", "Dyrektor ds. Rozwoju",
        "Kurator sądowy", "Analityk rynku", "Key account manager", "Fakturzystka", "Specjalista ds. obsługi klienta",
        "Technolog", "Administrator danych osobowych", "Dyrektor ds. Logistyki", "Tłumacz", "Konstruktor",
        "Doradca zawodowy", "Dyrektor ds. Personalnych", "Pełnomocnik ds. Jakości", "Specjalista ds. planowania produkcji",
        "Agent celny", "Dyrektor ds. Finansowych", "Asystentka zarządu", "Farmaceuta", "Architekt budownictwa",
        "Adwokat", "Project Manager", "Księgowa", "Projektant IT", "Specjalista ds. reklamacji",
        "Specjalista ds. inwestycji", "Copywriter", "Przedstawiciel handlowy", "Geodeta", "Doradca finansowy",
        "Administrator", "Inżynier Budowy", "Recepcjonistka", "Pracownik socjalny", "Lektor", "Pilot wycieczek",
        "Trener", "Konsultant ds. Wdrożeń", "Dziennikarz", "Product Manager", "Agenta nieruchomości",
        "Inżynier utrzymania ruchu", "Handlowiec", "Projektant konstrukcji budowlanych", "Specjalista ds. funduszy unijnych",
        "Przedstawiciel medyczny", "Office Manager", "Notariusz", "Programista PLC", "Doradca techniczno-handlowy",
        "Kierownik Magazynu", "Inżynier ds. Wdrażania Produkcji", "Specjalista ds. windykacji", "Rzeczoznawca",
        "Prezenter", "Dyrektor ds. Sprzedaży", "Specjalista ds. badań i rozwoju", "Kierownik punktu sprzedaży",
        "Radca prawny", "Dyrektor ds. Marketingu", "Kosztorysant", "Telemarketer", "Specjalista ds. dostaw",
        "Specjalista ds. pozycjonowania", "Doradca podatkowy", "Specjalista ds. ofertowania", "Dyrektor ds. Produkcji",
        "Kierownik kontraktu", "Analityk systemów", "Nauczyciel", "Specjalista ds. kadr i płac", "Specjalista ds. rekrutacji"];
    static CITIES: string[] = ["Warszawa", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz",
        "Lublin", "Katowice", "Białystok", "Gdynia", "Częstochowa", "Radom", "Sosnowiec", "Toruń", "Kielce", "Gliwice",
        "Rzeszów", "Zabrze", "Olsztyn", "Bielsko-Biała", "Bytom", "Ruda Śląska", "Rybnik", "Tychy", "Gorzów Wielkopolski",
        "Dąbrowa Górnicza", "Elbląg", "Płock", "Opole", "Zielona Góra", "Wałbrzych", "Włocławek", "Tarnów", "Chorzów",
        "Koszalin", "Kalisz", "Legnica", "Grudziądz", "Słupsk", "Jaworzno", "Jastrzębie-Zdrój", "Nowy Sącz", "Jelenia Góra",
        "Konin", "Siedlce", "Piotrków Trybunalski", "Mysłowice", "Inowrocław", "Piła", "Lubin", "Ostrów Wielkopolski",
        "Ostrowiec Świętokrzyski", "Gniezno", "Stargard Szczeciński", "Suwałki", "Głogów", "Siemianowice Śląskie",
        "Pabianice", "Chełm", "Zamość", "Tomaszów Mazowiecki", "Leszno", "Stalowa Wola", "Przemyśl", "Kędzierzyn-Koźle",
        "Łomża", "Żory", "Mielec", "Tarnowskie Góry", "Tczew", "Ełk", "Pruszków", "Bełchatów", "Świdnica", "Będzin",
        "Biała Podlaska", "Zgierz", "Piekary Śląskie", "Racibórz", "Legionowo", "Ostrołęka", "Świętochłowice", "Zawiercie",
        "Starachowice", "Wejherowo", "Puławy", "Wodzisław Śląski", "Skierniewice", "Starogard Gdański", "Tarnobrzeg",
        "Radomsko", "Skarżysko-Kamienna", "Rumia", "Krosno", "Kołobrzeg", "Dębica", "Kutno", "Otwock"];
    static STREETS: string[] = ["Polna", "Lesna", "Sloneczna", "Krótka", "Szkolna", "Ogrodowa", "Lipowa", "Brzozowa",
        "Lakowa", "Kwiatowa", "Sosnowa", "Koscielna", "Akacjowa", "Parkowa", "Zielona", "Kolejowa", "Sportowa",
        "Debowa", "Kosciuszki", "3 Maja", "Mickiewicza", "Cicha", "Spokojna", "Klonowa", "Spacerowa", "Świerkowa",
        "Kasztanowa", "Nowa", "Piaskowa", "Sienkiewicza", "Rózana", "Topolowa", "Wisniowa", "Dworcowa", "Wiejska",
        "Graniczna", "Slowackiego", "Długa", "Wrzosowa", "Konopnickiej", "Boczna", "Wąska", "Wierzbowa", "JaŚminowa",
        "Wspólna", "Modrzewiowa", "Kopernika", "JanaPawlaII", "Poprzeczna", "Wesola", "Pogodna", "Zeromskiego", "Rynek",
        "Bukowa", "WojskaPolskiego", "Sadowa", "Górna", "Jodlowa", "Wolnosci", "Glówna", "Mlynska", "Strazacka", "Prusa",
        "Jesionowa", "Przemyslowa", "Osiedlowa", "Wiosenna", "Sikorskiego", "Chopina", "Poludniowa", "Malinowa", "Stawowa",
        "Reymonta", "Pilsudskiego", "Zacisze", "Cmentarna", "Okrezna", "Kochanowskiego", "ArmiiKrajowej", "Mila", "Jasna",
        "Wodna", "Zamkowa", "Witosa", "Reja", "Warszawska", "Miodowa", "Partyzantów", "Krzywa", "Kilinskiego", "Dolna",
        "Podgórna", "Kreta", "Jarzebinowa", "Moniuszki", "Targowa", "Prosta", "Orzeszkowej", "Spóldzielcza", "Jagodowa"];
    static MALES: string[] = [
        "Adam",
        "Hubert",
        "Adrian",
        "Albert",
        "Aleksander",
        "Andrzej",
        "Antoni",
        "Arkadiusz",
        "Artur",
        "Bartłomiej",
        "Beniamin",
        "Błażej",
        "Brunon",
        "Damian",
        "Daniel",
        "Dawid",
        "Dariusz",
        "Dominik",
        "Edward",
        "Eugeniusz",
        "Filip",
        "Eryk",
        "Gabriel",
        "Grzegorz",
        "Henryk",
        "Ignacy",
        "Jacek",
        "Jakub",
        "Julian",
        "Jan",
        "Józef",
        "Jerzy",
        "Karol",
        "Kazimierz",
        "Konrad",
        "Krystian",
        "Krzysztof",
        "Ludwik",
        "Łukasz",
        "Maciej",
        "Mateusz",
        "Maksymilian",
        "Marcin",
        "Marek",
        "Michał",
        "Miłosz",
        "Patryk",
        "Paweł",
        "Piotr",
        "Rafał",
        "Robert",
        "Roman",
        "Ryszard",
        "Stanisław",
        "Stefan",
        "Szymon",
        "Tadeusz",
        "Teodor",
        "Tomasz",
        "Wiktor",
        "Wilhelm",
        "Zenon"];
    static FEMALES: string[] = [
        "Adrianna",
        "Agata",
        "Agnieszka",
        "Aleksandra",
        "Alicja",
        "Amanda",
        "Amelia",
        "Angelika",
        "Aniela",
        "Anna",
        "Basia",
        "Blanka",
        "Celina",
        "Cecylia",
        "Kornelia",
        "Kordelia",
        "Cyntia",
        "Daniela",
        "Dorota",
        "Eliza",
        "Edyta",
        "Elżbieta",
        "Emilia",
        "Ewa",
        "Ewelina",
        "Felicja",
        "Franciszka",
        "Gabriela",
        "Genowefa",
        "Hanna",
        "Ilona",
        "Iwona",
        "Irena",
        "Izabela",
        "Jadwiga",
        "Jaśmina",
        "Joanna",
        "Jolanta",
        "Jowita",
        "Józefa",
        "Judyta",
        "Julia",
        "Justyna",
        "Kamila",
        "Karolina",
        "Kasandra",
        "Katarzyna",
        "Klara",
        "Klarysa",
        "Klaudia",
        "Krystyna",
        "Lilia",
        "Lidia",
        "Liliana",
        "Laura",
        "Lucyna",
        "Magdalena",
        "Małgorzata",
        "Maria",
        "Martyna",
        "Maryna",
        "Marta",
        "Milena",
        "Monika",
        "Natalia",
        "Nikola",
        "Nina",
        "Ofelia",
        "Oktawia",
        "Olimpia",
        "Oliwia",
        "Urszula",
        "Patrycja",
        "Paulina",
        "Rozalia",
        "Róża",
        "Roksana",
        "Rebeka",
        "Samanta",
        "Sandra",
        "Sara",
        "Stefania",
        "Sylwia",
        "Teresa",
        "Wanessa",
        "Weronika",
        "Wiktoria",
        "Wiwiana",
        "Zofia",
        "Zuzanna"
    ];
    static SURNAMES: string[] = [
        "Nowak",
        "Kowalski",
        "Wiśniewski",
        "Dębrowski",
        "Lewandowski",
        "Wójcik",
        "Kamiński",
        "Kowalczyk",
        "Zieliński",
        "Szymański",
        "WoĽniak",
        "Kozłowski",
        "Jankowski",
        "Wojciechowski",
        "Kwiatkowski",
        "Kaczmarek",
        "Mazur",
        "Krawczyk",
        "Piotrowski",
        "Grabowski",
        "Nowakowski",
        "Pawłowski",
        "Michalski",
        "Nowicki",
        "Adamczyk",
        "Dudek",
        "Zajęc",
        "Wieczorek",
        "Jabłoński",
        "Król",
        "Majewski",
        "Olszewski",
        "Jaworski",
        "Wróbel",
        "Malinowski",
        "Pawlak",
        "Witkowski",
        "Walczak",
        "Stępień",
        "Górski",
        "Rutkowski",
        "Michalak",
        "Sikora",
        "Ostrowski",
        "Baran",
        "Duda",
        "Szewczyk",
        "Tomaszewski",
        "Pietrzak",
        "Marciniak",
        "Wróblewski",
        "Zalewski",
        "Jakubowski",
        "Jasiński",
        "Zawadzki",
        "Sadowski",
        "Bęk",
        "Chmielewski",
        "Włodarczyk",
        "Borkowski",
        "Czarnecki",
        "Sawicki",
        "Sokołowski",
        "Urbański",
        "Kubiak",
        "Maciejewski",
        "Szczepański",
        "Kucharski",
        "Wilk",
        "Kalinowski",
        "Lis",
        "Mazurek",
        "Wysocki",
        "Adamski",
        "KaĽmierczak",
        "Wasilewski",
        "Sobczak",
        "Czerwiński",
        "Andrzejewski",
        "Cieślak",
        "Głowacki",
        "Zakrzewski",
        "Kołodziej",
        "Sikorski",
        "Krajewski",
        "Gajewski",
        "Szymczak",
        "Szulc",
        "Baranowski",
        "Laskowski",
        "Brzeziński",
        "Makowski",
        "Ziółkowski",
        "Przybylski",
        "Domański",
        "Nowacki",
        "Borowski",
        "Błaszczyk",
        "Chojnacki",
        "Ciesielski",
        "Mróz",
        "Szczepaniak",
        "Wesołowski",
        "Górecki",
        "Krupa",
        "Kaczmarczyk",
        "Leszczyński",
        "Lipiński",
        "Kowalewski",
        "Urbaniak",
        "Kozak",
        "Kania",
        "Mikołajczyk",
        "Czajkowski",
        "Mucha",
        "Tomczak",
        "Kozioł",
        "Markowski",
        "Kowalik",
        "Nawrocki",
        "Brzozowski",
        "Janik",
        "Musiał",
        "Wawrzyniak",
        "Markiewicz",
        "Orłowski",
        "Tomczyk",
        "Jarosz",
        "Kołodziejczyk",
        "Kurek",
        "Kopeć",
        "Żak",
        "Wolski",
        "Łuczak",
        "Dziedzic",
        "Kot",
        "Stasiak",
        "Stankiewicz",
        "Piętek",
        "JóĽwiak",
        "Urban",
        "Dobrowolski",
        "Pawlik",
        "Kruk",
        "Domagała",
        "Piasecki",
        "Wierzbicki",
        "Karpiński",
        "Jastrzębski",
        "Polak",
        "Zięba",
        "Janicki",
        "Wójtowicz",
        "Stefański",
        "Sosnowski",
        "Bednarek",
        "Majchrzak",
        "Bielecki",
        "Małecki",
        "Maj",
        "Sowa",
        "Milewski",
        "Gajda",
        "Klimek",
        "Olejniczak",
        "Ratajczak",
        "Romanowski",
        "Matuszewski",
        "Śliwiński",
        "Madej",
        "Kasprzak",
        "Wilczyński",
        "Grzelak",
        "Socha",
        "Czajka",
        "Marek",
        "Kowal",
        "Bednarczyk",
        "Skiba",
        "Wrona",
        "Owczarek",
        "Marcinkowski",
        "Matusiak",
        "Orzechowski",
        "Sobolewski",
        "Kędzierski",
        "Kurowski",
        "Rogowski",
        "Olejnik",
        "Dębski",
        "Barański",
        "Skowroński",
        "Mazurkiewicz",
        "Pajęk",
        "Czech",
        "Janiszewski",
        "Bednarski",
        "Łukasik",
        "Chrzanowski",
        "Bukowski",
        "Leśniak",
        "Cieślik",
        "Kosiński",
        "Jędrzejewski",
        "Muszyński",
        "Świętek",
        "Kozieł",
        "Osiński",
        "Czaja",
        "Lisowski",
        "Kuczyński",
        "Żukowski",
        "Grzybowski",
        "Kwiecień",
        "Pluta",
        "Morawski",
        "Czyż",
        "Sobczyk",
        "Augustyniak",
        "Rybak",
        "Krzemiński",
        "Marzec",
        "Konieczny",
        "Marczak",
        "Zych",
        "Michalik",
        "Michałowski",
        "Kaczor",
        "Świderski",
        "Kubicki",
        "Gołębiowski",
        "Paluch",
        "Białek",
        "Niemiec",
        "Sroka",
        "Stefaniak",
        "Cybulski",
        "Kacprzak",
        "Marszałek",
        "Kasprzyk",
        "Małek",
        "Szydłowski",
        "Smoliński",
        "Kujawa",
        "Lewicki",
        "Przybysz",
        "Stachowiak",
        "Popławski",
        "Piekarski",
        "Matysiak",
        "Janowski",
        "Murawski",
        "Cichocki",
        "Witek",
        "Niewiadomski",
        "Staniszewski",
        "Bednarz",
        "Lech",
        "Rudnicki",
        "Kulesza",
        "Piętkowski",
        "Turek",
        "Chmiel",
        "Biernacki",
        "Sowiński",
        "Skrzypczak",
        "Podgórski",
        "Cichoń",
        "Rosiński",
        "Karczewski",
        "Żurek",
        "Drozd",
        "Żurawski",
        "Pietrzyk",
        "Komorowski",
        "Antczak",
        "Gołębiewski",
        "Góra",
        "Banach",
        "Filipiak",
        "Grochowski",
        "Krzyżanowski",
        "Graczyk",
        "Przybyła",
        "Gruszka",
        "Banaś",
        "Klimczak",
        "Siwek",
        "Konieczna",
        "Serafin",
        "Bieniek",
        "Godlewski",
        "Rak",
        "Kulik",
        "Maćkowiak",
        "Zawada",
        "Mikołajczak",
        "Różański",
        "Cieśla",
        "Długosz",
        "Śliwa",
        "Ptak",
        "Strzelecki"
    ];
    static LOREM_IPSUM: string = "Lorem ipsum dolor sit amet enim. Etiam ullamcorper. Suspendisse a pellentesque dui, non felis. Maecenas malesuada elit lectus felis, malesuada ultricies. Curabitur et ligula. Ut molestie a, ultricies porta urna. Vestibulum commodo volutpat a, convallis ac, laoreet enim. Phasellus fermentum in, dolor. Pellentesque facilisis. Nulla imperdiet sit amet magna. Vestibulum dapibus, mauris nec malesuada fames ac turpis velit, rhoncus eu, luctus et interdum adipiscing wisi. Aliquam erat ac ipsum. Integer aliquam purus. Quisque lorem tortor fringilla sed, vestibulum id, eleifend justo vel bibendum sapien massa ac turpis faucibus orci luctus non, consectetuer lobortis quis, varius in, purus. Integer ultrices posuere cubilia Curae, Nulla ipsum dolor lacus, suscipit adipiscing. Cum sociis natoque penatibus et ultrices volutpat. Nullam wisi ultricies a, gravida vitae, dapibus risus ante sodales lectus blandit eu, tempor diam pede cursus vitae, ultricies eu, faucibus quis, porttitor eros cursus lectus, pellentesque eget, bibendum a, gravida ullamcorper quam. Nullam viverra consectetuer. Quisque cursus et, porttitor risus. Aliquam sem. In hendrerit nulla quam nunc, accumsan congue. Lorem ipsum primis in nibh vel risus. Sed vel lectus. Ut sagittis, ipsum dolor quam.";

    /**
     * Pomiar czasu wykonywania metody
     * @param context
     * @param name
     * @param callback
     * @param args
     * @return {*}
     */
    static duration(context: ?any, name: string, callback: () => any, ...args) {
        let ts = new Date().getTime();

        const result = callback(...args);

        ts = new Date().getTime() - ts;
        if (ts > 30)
            Dev.warning(context, name + ", czas trwania - " + ts + " ms");

        return result;
    }

    static group(context: ?any | any[], value: ?mixed, ...other: any) {
        window.console.groupCollapsed(format(context, value));
        (other || []).forEach(item => window.console.debug(item));
        window.console.groupEnd();
    }

    static log(context: ?any | any[], value: ?mixed, ...args: any) {
        if (DEBUG_MODE)
            window.console.debug(format(context, value), ...args);
    }

    static warning(context: ?any | any[], value: ?mixed, ...args: any) {
        window.console.warn(value instanceof Error ? value : format(context, value), ...args);
    }

    static error(context: ?any | any[], value: ?mixed, ...args: any) {
        window.console.error(value instanceof Error ? value : format(context, value), ...args);
        if (!DEBUG_MODE || !(value instanceof EError) || (!(value: EError).handled))
            ErroHandler.onError(format(context, value));
    }

    static dir(value: ?mixed, ...args: any) {
        window.console.dir(value, ...args);
    }

    static randomPostCode(): string {
        const rnd = () => "" + Math.floor(Math.random() * 10);
        return rnd() + rnd() + "-" + rnd() + rnd() + rnd();

    }

    static randomUser() {
        const male = Math.random() >= 0.5;
        let lname = Dev.SURNAMES.random();
        if (!male && lname.endsWith("ki"))
            lname = lname.substring(0, lname.length - 1) + "a";
        return {
            male: male,
            firstName: ( male ? Dev.MALES : Dev.FEMALES).random(),
            lastName: lname
        }
    }

}


function format(context: ?any | any[], value: ?mixed): string {
    if (value === null || value === undefined) {
        value = context;
        context = null;
    }

    let out: string = "";

    const ctxArr: string[] = context ? Utils.asArray(context) : [];


    Utils.forEach(ctxArr, (ctx) => {

        if (ctx && ctx.node && ctx.node.currentPage && ctx.node.currentPage.title.title)
            ctxArr.push('"' + ctx.node.currentPage.title.title + '"');

    });


    if (ctxArr.length)
        out = "[" + Utils.getContextName(ctxArr) + "] ";

    // $FlowFixMe: zignoruj ostrzeżenie
    return out + value;
}

