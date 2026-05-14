import json
import os
import psycopg2
import psycopg2.extras

HEADERS = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

def handler(event: dict, context) -> dict:
    """Управление метками (точками интереса) навигатора"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**HEADERS, 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    method = event.get('httpMethod', 'GET')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        session_id = params.get('session_id', 'default')
        cur.execute("SELECT id, name, description, category, lat, lng, color, icon, created_at FROM nav_markers WHERE session_id = '" + session_id.replace("'", "''") + "' ORDER BY created_at DESC")
        rows = cur.fetchall()
        markers = [dict(r) for r in rows]
        for m in markers:
            if m.get('created_at'):
                m['created_at'] = m['created_at'].isoformat()
            m['lat'] = float(m['lat'])
            m['lng'] = float(m['lng'])
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'markers': markers})}

    elif method == 'POST':
        body = json.loads(event.get('body') or '{}')
        sid = body.get('session_id', 'default').replace("'", "''")
        name = body['name'].replace("'", "''")
        desc = body.get('description', '').replace("'", "''")
        cat = body.get('category', 'general').replace("'", "''")
        color = body.get('color', '#00FFB3').replace("'", "''")
        icon = body.get('icon', 'MapPin').replace("'", "''")
        lat = float(body['lat'])
        lng = float(body['lng'])
        cur.execute(f"INSERT INTO nav_markers (session_id, name, description, category, lat, lng, color, icon) VALUES ('{sid}', '{name}', '{desc}', '{cat}', {lat}, {lng}, '{color}', '{icon}') RETURNING id")
        new_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'id': new_id, 'ok': True})}

    elif method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        marker_id = int(params.get('id', 0))
        cur.execute(f"DELETE FROM nav_markers WHERE id = {marker_id}")
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'ok': True})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
