import json
import os
import psycopg2
import psycopg2.extras

HEADERS = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

def handler(event: dict, context) -> dict:
    """Управление записанными треками навигатора"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**HEADERS, 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    method = event.get('httpMethod', 'GET')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        session_id = params.get('session_id', 'default').replace("'", "''")
        cur.execute(f"SELECT id, name, points, distance_m, duration_s, started_at, finished_at, created_at FROM nav_tracks WHERE session_id = '{session_id}' ORDER BY created_at DESC LIMIT 50")
        rows = cur.fetchall()
        tracks = [dict(r) for r in rows]
        for t in tracks:
            for field in ['started_at', 'finished_at', 'created_at']:
                if t.get(field):
                    t[field] = t[field].isoformat()
            if t.get('distance_m') is not None:
                t['distance_m'] = float(t['distance_m'])
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'tracks': tracks})}

    elif method == 'POST':
        body = json.loads(event.get('body') or '{}')
        sid = body.get('session_id', 'default').replace("'", "''")
        name = body['name'].replace("'", "''")
        points_json = json.dumps(body.get('points', [])).replace("'", "''")
        dist = float(body.get('distance_m', 0))
        dur = int(body.get('duration_s', 0))
        started = body.get('started_at')
        finished = body.get('finished_at')
        started_sql = f"'{started}'" if started else 'NULL'
        finished_sql = f"'{finished}'" if finished else 'NULL'
        cur.execute(f"INSERT INTO nav_tracks (session_id, name, points, distance_m, duration_s, started_at, finished_at) VALUES ('{sid}', '{name}', '{points_json}', {dist}, {dur}, {started_sql}, {finished_sql}) RETURNING id")
        new_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'id': new_id, 'ok': True})}

    elif method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        track_id = int(params.get('id', 0))
        cur.execute(f"DELETE FROM nav_tracks WHERE id = {track_id}")
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'ok': True})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
