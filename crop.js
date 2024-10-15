

async function crop(url, out){

    const img = await Jimp.read(url);
    img.crop({x:123, y:90, w:188, h:56})
    await img.write(out);

}