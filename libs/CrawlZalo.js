const puppeteer = require('puppeteer');
const pool = require("../pgconnect")
var fs = require("fs");
const PUPPETEER_OPTIONS = {
    headless: false,
    args: [
    ],
};

class CrawlZalo {

    /**
     * Puppeteer browser.
     * @type {puppeteer.Browser}
     */
    browser;

    /**
     * Create new browser if not opened.
     */
    async openBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch(PUPPETEER_OPTIONS);
        }
    }

    /**
     * Close browser.
     */
    async closeBrowser() {
        await this.browser.close();
    }

    async crawl() {
        await this.crawlProductDetail();
    }

    /**
     * 会社のファンダメンタル情報を取得して、このオブジェクトの変数に保管する。
     */
    // https://www.bypartshop.com/
    // 51 3459
    /* const arrayList = [2134,2814,2440
        857,1720,1658,1656,1650,1647,1632,1589,1192,1179,1176,1160,679,692,743,756,758,1077,773,790,794,875,909,943,945,893,895,903,963,969] 
*/


    async crawlProductDetail() {
        try {
            for (let i = 2822; i <= 3459; i++) {

                const page = await this.browser.newPage();
                console.log(i)
                const url = `https://www.bypartshop.com/product/${i}`;
                let result

                try {
                    result = await page.goto(url)
                    await page.waitForTimeout(5000);
                    console.info('No error thrown')

                    if (result.status() === 404) {
                        console.error('404 status code found in result')
                        i++
                        await page.close();
                    } else {
                        // console.log(status.toString())
                        await page.waitForSelector('#productPageHTML');

                        const imgs = await page.$$eval('.VueCarousel-inner img[src]', imgs => imgs.map(img =>
                            img.getAttribute('src')));
                        const image = imgs.toString()
                        const crawled = await page.evaluate(() => {
                            const data = {
                                title: document.querySelector('.headerText').innerText,
                                newPrice: document.querySelector('.mainPrice span').innerText,
                                product_code: document.querySelector('.product_code').innerText,
                                oldPrice: document.querySelector('.oldPrice').innerText,
                                product_code: document.querySelector('.product_code').innerText,
                                categoryTR: document.querySelector('.categoryTR').innerText,
                                stateTR: document.querySelector('.stateTR').innerText,
                                stateOptionTR: document.querySelector('.stateOptionTR').innerText,
                                typeTR: document.querySelector('.typeTR').innerText,
                                ratingTR: document.querySelector('.ratingTR').innerText,

                            }
                            return data;
                        });

                        const checkData = await pool.query(`
                    select id from bypartshopdata where id = ${i}
                `)
                        if (checkData.rowCount > 0) {

                        } else {
                            const newTodo = await pool.query(
                                `insert into bypartshopdata(
                            id,title,"newPrice",product_code,"oldPrice",
                            "categoryTR","stateTR","stateOptionTR","typeTR","ratingTR",image
                        )
                        values(
                           ${i},N'${crawled.title}',N'${crawled.newPrice}',N'${crawled.product_code}',N'${crawled.oldPrice}',N'${crawled.categoryTR}',
                            N'${crawled.stateTR}',N'${crawled.stateOptionTR}',N'${crawled.typeTR}',N'${crawled.ratingTR}',N'${image}'
                        )
                        `
                            )
                        }
                        // Table



                        await page.close();
                    }
                } catch (err) {
                    i++
                    console.error('Error thrown')
                }


            }
        } catch (error) {
            console.log(error)
        }


    }
    async crawlZalo() {
        try {
            var Mesage =
                `Cả nhà yêu ơi bấm like vào follow trang page của mình nhé
Yêu nhà mình
https://www.facebook.com/99plusstudioo
`
            // Sleep
            function sleep(milliseconds) {
                const date = Date.now();
                let currentDate = null;
                do {
                    currentDate = Date.now();
                } while (currentDate - date < milliseconds);
            }
            const page = await this.browser.newPage();

            const url = `https://chat.zalo.me/`;
            let result

            result = await page.goto(url)

            if (result.status() === 404) {
                console.error('404 status code found in result')
            } else {
                // Delay 60s thời gian đăng nhập zalo
                await page.waitForTimeout(60000);
                // focus đến ô tìm kiếm
                // 034 5 990 398
                for (let i = 1000000; i <= 2000000; i++) {
                    const phoneNumber = `034` + "0".repeat(7 - (i).toString().length) + i
                    const foo = await page.$('#contact-search-input');
                    await foo.click({ clickCount: 3 });
                    await page.keyboard.type(`034 ` + "0".repeat(7 - (i).toString().length) + i)

                    sleep(1500)

                    // console.log(`034 ` + "0".repeat(7 - (i).toString().length) + i)

                    const numberOfDivs = await page.evaluate(_ => {
                        return document.querySelectorAll('.list-friend-conctact').length;
                    });

                    console.log(numberOfDivs)
                    if (parseInt(numberOfDivs) > 0) {
                        const crawed = await page.evaluate(async () => {
                            const content = document.querySelector('.list-friend-conctact').innerText;
                            console.log(content)
                            return content;
                        })
                        const backgroundImage = await page.evaluate(el => window.getComputedStyle(el).backgroundImage, await page.$('.list-friend-conctact__avatar .avatar-img'))

                        const backgroundImageUrl = backgroundImage.substring(5, backgroundImage.length - 2);
                        await page.click('.list-friend-conctact__avatar .avatar-img')
                        sleep(2500)
                        await page.click('.threadChat__avatar .avatar--profile-v2')

                        
                        // sleep(2500)
                        // friend-profile__groups
                        const numberOfStt = await page.evaluate(_ => {
                            return document.querySelectorAll('.stt').length;
                        });
                        var sttProfile = ' '
                        console.log('stt number : '+ numberOfStt)
                        if(parseInt(numberOfStt)>0){
                            sttProfile = await page.evaluate(_ => {
                                return document.querySelector('.stt').innerText;
                            })
                        }else{
                         
                        }
                        sleep(3000)
                        const crawledProfile = await page.evaluate(async () => {
                            const data = {
                                profile : document.querySelector('.friend-profile__groups').innerText
                            }
                                return data
                        })
                        await page.click('.modal-header-icon')
                        sleep(500)
                        await page.click('.conv-back-btn')
                        console.log(crawed.split('\n')[0])
                        console.log(phoneNumber)
                        console.log(backgroundImageUrl)
                        console.log(crawledProfile)
                        console.log(sttProfile)
                        const checkQuery = await pool.query(`
                            select * from chatzalo where id = ${phoneNumber}
                        `)
                        if(checkQuery.rows.length > 0){

                        }else{
                            const excuteQuery = await pool.query(`
                            insert into chatzalo(id,name,image,profile,phone,note,sex,birthday)
                            values(${phoneNumber},N'${crawed.split('\n')[0]}',N'${backgroundImageUrl}',N'${crawledProfile.profile}',N'${phoneNumber}',N'${sttProfile}',
                            N'${crawledProfile.profile.indexOf('Nữ') > 0 ? "Nữ" : 'Nam'}',N'${crawledProfile.profile.split('Ngày sinh\n')[1]}'
                            )
                        `)
                        }
                    } else {
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }



    }

    async sendZalo() {
        try {
            var Mesage =
                `Cả nhà yêu ơi bấm like vào follow trang page của mình nhé
Yêu nhà mình
https://www.facebook.com/99plusstudioo
`
            // Sleep
            function sleep(milliseconds) {
                const date = Date.now();
                let currentDate = null;
                do {
                    currentDate = Date.now();
                } while (currentDate - date < milliseconds);
            }
            const page = await this.browser.newPage();

            const url = `https://chat.zalo.me/`;
            let result

            result = await page.goto(url)

            if (result.status() === 404) {
                console.error('404 status code found in result')
            } else {
                // Delay 60s thời gian đăng nhập zalo
                await page.waitForTimeout(60000);
                const newData = await fetch('http://103.127.207.24:3004/ChatZaloData')
                .then(res => res.json())
                .then(json => {
                    return json
                } );

                // console.log(newData.length)
                // console.log(newData)
                for (let i = 0 ; i <= newData.length ; i++){
                    sleep(10500)
                    console.log(newData[i])
                    const foo = await page.$('#contact-search-input');
                    await foo.click({ clickCount: 3 });
                    await page.keyboard.type(newData[i].phone)

                    sleep(1500)
                    const numberOfDivs = await page.evaluate(_ => {
                        return document.querySelectorAll('.list-friend-conctact').length;
                    });

                    if (parseInt(numberOfDivs) > 0) {
                        
                        const clickListUser = await page.$('.list-friend-conctact')
                        await clickListUser.click({ clickCount: 3 })
                        sleep(1500)
                        const clickAvata = await page.$("#input_line_0")
                        await clickAvata.click({ clickCount: 3 })

                        await page.keyboard.type(Mesage)

                        await page.press('Enter');
                    } else {

                    }

                }


                // focus đến ô tìm kiếm
                // 034 5 990 398
                // input_line_0
                // for (let i = 5990390; i <= 5990400; i++) {
                //     const phoneNumber = `034` + "0".repeat(7 - (i).toString().length) + i
                //     const foo = await page.$('#contact-search-input');
                //     await foo.click({ clickCount: 3 });
                //     await page.keyboard.type(`034 ` + "0".repeat(7 - (i).toString().length) + i)

                //     sleep(1500)

                //     // console.log(`034 ` + "0".repeat(7 - (i).toString().length) + i)

                //     const numberOfDivs = await page.evaluate(_ => {
                //         return document.querySelectorAll('.list-friend-conctact').length;
                //     });

                //     console.log(numberOfDivs)
                //     if (parseInt(numberOfDivs) > 0) {
                //         const crawed = await page.evaluate(async () => {
                //             const content = document.querySelector('.list-friend-conctact').innerText;
                //             console.log(content)
                //             return content;
                //         })
                //         const backgroundImage = await page.evaluate(el => window.getComputedStyle(el).backgroundImage, await page.$('.list-friend-conctact__avatar .avatar-img'))

                //         const backgroundImageUrl = backgroundImage.substring(5, backgroundImage.length - 2);

                //         const clickListUser = await page.$('.list-friend-conctact')
                //         await clickListUser.click({ clickCount: 3 })
                //         sleep(2500)
                //         const clickAvata = await page.$(".threadChat__avatar clickable")
                //         await clickAvata.click({ clickCount: 3 })
                //         // friend-profile__groups
                //         const crawledProfile = await page.evaluate(async () => {
                //             const numberOfProfile = await page.evaluate(_ => {
                //                 return document.querySelectorAll('.list-friend-conctact').length;
                //             });
                //             if (parseInt(numberOfProfile) > 0) {
                //                 const data = {
                //                     profile: document.querySelector('.friend-profile__groups').innerText,
                //                     stt:
                //                         parseInt(await page.evaluate(_ => {
                //                             return document.querySelectorAll('.list-friend-conctact').length;
                //                         })) > 0 ? document.querySelector('.stt').innerText : ' '
                //                     ,
                //                 }
                //                 return data
                //             } else {
                //                 return {
                //                     profile: ' ',
                //                     stt: ' '
                //                 }
                //             }
                //         })
                //         console.log(crawed)
                //         console.log(phoneNumber)
                //         console.log(backgroundImageUrl)
                //         console.log(crawledProfile)
                //     } else {

                //     }


                // }


            }
        } catch (error) {
            console.log(error)
        }

    }
}

module.exports = CrawlZalo;
