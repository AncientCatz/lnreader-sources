import cheerio from "react-native-cheerio";

const baseUrl = "https://vipnovel.com/";

const popularNovels = async (page) => {
    let totalPages = 89;
    let url = `${baseUrl}vipnovel/page/${page}/?m_orderby=rating`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".page-item-detail").each(function (result) {
        const novelName = $(this).find("h5 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("h5 > a").attr("href");
        novelUrl = novelUrl.replace(`${baseUrl}vipnovel/`, "");

        const novel = {
            sourceId: 10,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}vipnovel/${novelUrl}`;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 10;

    novel.sourceName = "VipNovel";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".post-title > h3")
        .text()
        .replace(/[\t\n]/g, "")
        .trim();

    novel.novelCover = $(".summary_image > a > img").attr("src");
    $(".post-content_item").each(function (result) {
        detailName = $(this)
            .find(".summary-heading > h5")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();
        detail = $(this)
            .find(".summary-content")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        switch (detailName) {
            case "Genre(s)":
                novel.genre = detail.trim().replace(/[\t\n]/g, ",");
                break;
            case "Author(s)":
                novel.author = detail.trim();
                break;
            case "Artist(s)":
                novel.status = detail.trim();
                break;
        }
    });

    $(".summary__content > p").first().remove();

    let novelSummary = $(".description-summary > div.summary__content")
        .text()
        .replace("Synopsis", "");

    novel.summary = novelSummary.replace(/[\t\n]/g, "");

    let novelChapters = [];

    $(".wp-manga-chapter").each(function (result) {
        const chapterName = $(this)
            .find("a")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        const releaseDate = $(this)
            .find("span")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        const chapterUrl = $(this).find("a").attr("href").replace(url, "");

        const chapter = { chapterName, releaseDate, chapterUrl };

        console.log(chapterUrl);

        novelChapters.push(chapter);
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = baseUrl + "vipnovel/" + novelUrl + chapterUrl;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $(".text-center").text();

    if (!chapterName) {
        chapterName = $(".text-left > div> h3").text();
    }

    let chapterText = $(".text-left").html();
    const chapter = {
        sourceId: 10,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".c-tabs-item__content").each(function (result) {
        const novelName = $(this).find("h4 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("h4 > a").attr("href");
        novelUrl = novelUrl.replace(`${baseUrl}vipnovel/`, "");

        const novel = {
            sourceId: 10,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const vipNovelScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default vipNovelScraper;
