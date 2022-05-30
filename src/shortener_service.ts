import { Request, Response } from 'express';


function shortener_view(req:Request, res:Response) {
    res.json({ res: 'Hello World!' });
}


export default shortener_view;
