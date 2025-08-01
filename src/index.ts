// src/index.ts

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Define the environment bindings
export interface Env {
    DB: D1Database;
    DB_TABLE_MENTORS: string;
    DB_TABLE_MENTEES: string;
    DB_TABLE_SUPPORTERS: string;
}

const app = new Hono<{ Bindings: Env }>();

// Setup CORS for all routes
app.use('/api/*', cors({ origin: '*' }));

// --- API Endpoints ---

// 1. Get Dashboard Stats
app.get('/api/stats', async (c) => {
    const { DB, DB_TABLE_MENTORS, DB_TABLE_MENTEES, DB_TABLE_SUPPORTERS } = c.env;

    try {
        const mentorsCount = await DB.prepare(`SELECT COUNT(*) as count FROM ${DB_TABLE_MENTORS}`).first('count');
        const menteesCount = await DB.prepare(`SELECT COUNT(*) as count FROM ${DB_TABLE_MENTEES}`).first('count');
        const supportersCount = await DB.prepare(`SELECT COUNT(*) as count FROM ${DB_TABLE_SUPPORTERS}`).first('count');

        return c.json({
            mentors: mentorsCount || 0,
            mentees: menteesCount || 0,
            supporters: supportersCount || 0,
        });
    } catch (e) {
        console.error(e);
        return c.json({ error: 'Failed to fetch stats' }, 500);
    }
});

// 2. Get Applications by Type
app.get('/api/applications/:type', async (c) => {
    const { type } = c.req.param();
    const { DB, DB_TABLE_MENTORS, DB_TABLE_MENTEES, DB_TABLE_SUPPORTERS } = c.env;

    let tableName;
    switch (type) {
        case 'mentors':
            tableName = DB_TABLE_MENTORS;
            break;
        case 'mentees':
            tableName = DB_TABLE_MENTEES;
            break;
        case 'supporters':
            tableName = DB_TABLE_SUPPORTERS;
            break;
        default:
            return c.json({ error: 'Invalid application type' }, 400);
    }

    try {
        const { results } = await DB.prepare(`SELECT * FROM ${tableName} ORDER BY created_at DESC`).all();
        return c.json(results);
    } catch (e) {
        console.error(e);
        return c.json({ error: `Failed to fetch ${type}` }, 500);
    }
});

// 3. Submit New Application (Mentor)
app.post('/api/applications/mentors', async (c) => {
    const { DB, DB_TABLE_MENTORS } = c.env;
    const { name, email, specialization } = await c.req.json();

    if (!name || !email) {
        return c.json({ error: 'Name and email are required' }, 400);
    }

    try {
        await DB.prepare(`INSERT INTO ${DB_TABLE_MENTORS} (name, email, specialization) VALUES (?, ?, ?)`)
            .bind(name, email, specialization)
            .run();
        return c.json({ message: 'Mentor application submitted successfully' }, 201);
    } catch (e: any) {
        console.error(e);
        if (e.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Email already exists' }, 409);
        }
        return c.json({ error: 'Failed to submit mentor application' }, 500);
    }
});

// 4. Submit New Application (Mentee)
app.post('/api/applications/mentees', async (c) => {
    const { DB, DB_TABLE_MENTEES } = c.env;
    const { name, email, business_description } = await c.req.json();

    if (!name || !email) {
        return c.json({ error: 'Name and email are required' }, 400);
    }

    try {
        await DB.prepare(`INSERT INTO ${DB_TABLE_MENTEES} (name, email, business_description) VALUES (?, ?, ?)`)
            .bind(name, email, business_description)
            .run();
        return c.json({ message: 'Mentee application submitted successfully' }, 201);
    } catch (e: any) {
        console.error(e);
        if (e.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Email already exists' }, 409);
        }
        return c.json({ error: 'Failed to submit mentee application' }, 500);
    }
});

// 5. Submit New Application (Supporter)
app.post('/api/applications/supporters', async (c) => {
    const { DB, DB_TABLE_SUPPORTERS } = c.env;
    const { name, email, support_area } = await c.req.json();

    if (!name || !email) {
        return c.json({ error: 'Name and email are required' }, 400);
    }

    try {
        await DB.prepare(`INSERT INTO ${DB_TABLE_SUPPORTERS} (name, email, support_area) VALUES (?, ?, ?)`)
            .bind(name, email, support_area)
            .run();
        return c.json({ message: 'Supporter application submitted successfully' }, 201);
    } catch (e: any) {
        console.error(e);
        if (e.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Email already exists' }, 409);
        }
        return c.json({ error: 'Failed to submit supporter application' }, 500);
    }
});

// 6. Update Application Status
app.put('/api/applications/:type/:id/status', async (c) => {
    const { type, id } = c.req.param();
    const { status } = await c.req.json();
    const { DB, DB_TABLE_MENTORS, DB_TABLE_MENTEES, DB_TABLE_SUPPORTERS } = c.env;

    let tableName;
    switch (type) {
        case 'mentors':
            tableName = DB_TABLE_MENTORS;
            break;
        case 'mentees':
            tableName = DB_TABLE_MENTEES;
            break;
        case 'supporters':
            tableName = DB_TABLE_SUPPORTERS;
            break;
        default:
            return c.json({ error: 'Invalid application type' }, 400);
    }

    if (!status || !['new', 'approved', 'rejected'].includes(status)) {
        return c.json({ error: 'Invalid status provided' }, 400);
    }

    try {
        const result = await DB.prepare(`UPDATE ${tableName} SET status = ? WHERE id = ?`)
            .bind(status, id)
            .run();

        if (result.changes === 0) {
            return c.json({ error: 'Application not found or status already set' }, 404);
        }
        return c.json({ message: 'Application status updated successfully' });
    } catch (e) {
        console.error(e);
        

// 7. Get Single Application Details
app.get('/api/applications/:type/:id', async (c) => {
    const { type, id } = c.req.param();
    const { DB, DB_TABLE_MENTORS, DB_TABLE_MENTEES, DB_TABLE_SUPPORTERS } = c.env;

    let tableName;
    switch (type) {
        case 'mentors':
            tableName = DB_TABLE_MENTORS;
            break;
        case 'mentees':
            tableName = DB_TABLE_MENTEES;
            break;
        case 'supporters':
            tableName = DB_TABLE_SUPPORTERS;
            break;
        default:
            return c.json({ error: 'Invalid application type' }, 400);
    }

    try {
        const result = await DB.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).bind(id).first();
        if (!result) {
            return c.json({ error: 'Application not found' }, 404);
        }
        return c.json(result);
    } catch (e) {
        console.error(e);
        return c.json({ error: 'Failed to fetch application' }, 500);
    }
});

// 8. Update Application Details
app.put('/api/applications/:type/:id', async (c) => {
    const { type, id } = c.req.param();
    const body = await c.req.json();
    const { DB, DB_TABLE_MENTORS, DB_TABLE_MENTEES, DB_TABLE_SUPPORTERS } = c.env;

    let tableName;
    let fields;
    let values;

    switch (type) {
        case 'mentors':
            tableName = DB_TABLE_MENTORS;
            fields = ['name', 'email', 'specialization'];
            values = [body.name, body.email, body.specialization];
            break;
        case 'mentees':
            tableName = DB_TABLE_MENTEES;
            fields = ['name', 'email', 'business_description'];
            values = [body.name, body.email, body.business_description];
            break;
        case 'supporters':
            tableName = DB_TABLE_SUPPORTERS;
            fields = ['name', 'email', 'support_area'];
            values = [body.name, body.email, body.support_area];
            break;
        default:
            return c.json({ error: 'Invalid application type' }, 400);
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    try {
        const result = await DB.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`)
            .bind(...values, id)
            .run();

        if (result.changes === 0) {
            return c.json({ error: 'Application not found' }, 404);
        }
        return c.json({ message: 'Application updated successfully' });
    } catch (e) {
        console.error(e);
        return c.json({ error: 'Failed to update application' }, 500);
    }
});

// 9. Delete Application
app.delete('/api/applications/:type/:id', async (c) => {
    const { type, id } = c.req.param();
    const { DB, DB_TABLE_MENTORS, DB_TABLE_MENTEES, DB_TABLE_SUPPORTERS } = c.env;

    let tableName;
    switch (type) {
        case 'mentors':
            tableName = DB_TABLE_MENTORS;
            break;
        case 'mentees':
            tableName = DB_TABLE_MENTEES;
            break;
        case 'supporters':
            tableName = DB_TABLE_SUPPORTERS;
            break;
        default:
            return c.json({ error: 'Invalid application type' }, 400);
    }

    try {
        const result = await DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();
        if (result.changes === 0) {
            return c.json({ error: 'Application not found' }, 404);
        }
        return c.json({ message: 'Application deleted successfully' });
    } catch (e) {
        console.error(e);
        return c.json({ error: 'Failed to delete application' }, 500);
    }
});

export default app;