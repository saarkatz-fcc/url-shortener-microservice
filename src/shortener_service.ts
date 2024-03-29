import util from 'node:util';
import dns from 'node:dns';
import { Request, Response } from 'express';
import UrlRelation, { IUrlRelation } from './models/urlrelation';


function generate_string(length: number): string {
    let outString: string = '';
    const inOptions: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < length; i++) {
        outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }

    return outString;
}

async function try_get_or_create(url: URL, tries: number = 3, shorturl_length: number = 11): Promise<IUrlRelation | null> {
    let url_relation = new UrlRelation({original_url: url});

    // Check if this url already exists in the db
    // If it doesn't create a new one
    const relation_exists = await UrlRelation.findOne({ og_url: url_relation.og_url }).exec();
    if (relation_exists) {
        url_relation = relation_exists;
    }
    else {
        let success = false;

        // For the slim chance that a link with the same generated short url exists, we will retry this operation a number of times.
        while (!success && tries > 0) {
            try {
                url_relation.short_url = generate_string(shorturl_length);
                await url_relation.save();
            }
            catch {
                tries -= 1;
                continue;
            }
            success = true;
        }
        
        // In the case we failed to create a unique link we will return null.
        if (!success) {
            return null;
        }
    }

    return url_relation;
}

async function create_shorturl(req:Request, res:Response) {
    let original_url: URL;
    try {
        original_url = new URL(req.body.url);
    }
    catch {
        res.status(400).json({ error: 'invalid url' });
        return;
    }

    // Assert supported protocoles
    if (!['http:', 'https:'].includes(original_url.protocol)) {
        res.status(400).json({ error: 'invalid url' });
        return;
    }

    // Varify hostname
    try {
        // Warning: Possible side-channel attack. Take care with dns configuration of the host.
        const lookup = util.promisify(dns.lookup);
        await lookup(original_url.hostname);
    }
    catch {
        res.status(400).json({ error: 'invalid hostname' });
        return;
    }

    // Get an existing shorturl or create a new one
    const url_relation = await try_get_or_create(original_url)
    
    // Return the created url 
    if (url_relation) {
        res.json({ original_url: url_relation.og_url, short_url: url_relation.short_url });
    }
    else {
        res.json({ error: 'failed to create short url'});
    }
}

async function redirect_shorturl(req:Request, res:Response) {
    const short_url = req.params.shorturl;

    const url_relation = await UrlRelation.findOneAndUpdate({short_url}, {last_access: Date.now()}).exec();

    if (url_relation) {
        res.redirect(url_relation.og_url);
    }
    else {
        res.status(404).json({ error: 'short url not found' });
    }
}


export { create_shorturl, redirect_shorturl };
