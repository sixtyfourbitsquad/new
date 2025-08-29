import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.NETLIFY_DATABASE_URL);

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { method, path } = event;
    const body = event.body ? JSON.parse(event.body) : {};

    // Route based on path and method
    if (path.includes('/clients')) {
      return await handleClients(method, body, headers);
    } else if (path.includes('/logs')) {
      return await handleLogs(method, body, headers);
    } else if (path.includes('/cycles')) {
      return await handleCycles(method, body, headers);
    } else if (path.includes('/all')) {
      return await handleGetAll(headers);
    } else {
      return await handleGetAll(headers); // Default to get all data
    }

  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      })
    };
  }
};

// Handle client operations
async function handleClients(method, body, headers) {
  switch (method) {
    case 'GET':
      const clients = await sql`SELECT * FROM clients ORDER BY name`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(clients)
      };

    case 'POST':
      const { name, type, domain } = body;
      if (!name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Client name is required' })
        };
      }
      
      const newClient = await sql`
        INSERT INTO clients (name, type, domain) 
        VALUES (${name}, ${type || 'Website'}, ${domain || null})
        RETURNING *
      `;
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newClient[0])
      };

    case 'PUT':
      const { id, ...updateData } = body;
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Client ID is required' })
        };
      }
      
      const updatedClient = await sql`
        UPDATE clients 
        SET name = ${updateData.name}, type = ${updateData.type}, domain = ${updateData.domain}
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (updatedClient.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Client not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedClient[0])
      };

    case 'DELETE':
      const clientId = body.id;
      if (!clientId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Client ID is required' })
        };
      }
      
      // Delete associated logs and cycles first
      await sql`DELETE FROM logs WHERE client_id = ${clientId}`;
      await sql`DELETE FROM cycles WHERE client_id = ${clientId}`;
      await sql`DELETE FROM clients WHERE id = ${clientId}`;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Client and associated data deleted successfully' })
      };

    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
  }
}

// Handle log operations
async function handleLogs(method, body, headers) {
  switch (method) {
    case 'GET':
      const logs = await sql`
        SELECT l.*, c.name as client_name 
        FROM logs l 
        LEFT JOIN clients c ON l.client_id = c.id 
        ORDER BY l.date DESC
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(logs)
      };

    case 'POST':
      const { clientId, taskType, details, date, amount = 0, paid = false } = body;
      if (!clientId || !taskType || !date) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Client ID, task type, and date are required' })
        };
      }
      
      const newLog = await sql`
        INSERT INTO logs (client_id, task_type, details, date, amount, paid, timestamp) 
        VALUES (${clientId}, ${taskType}, ${details}, ${date}, ${amount}, ${paid}, ${new Date().toISOString()})
        RETURNING *
      `;
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newLog[0])
      };

    case 'PUT':
      const { id, ...logUpdateData } = body;
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Log ID is required' })
        };
      }
      
      const updatedLog = await sql`
        UPDATE logs 
        SET client_id = ${logUpdateData.clientId}, 
            task_type = ${logUpdateData.taskType}, 
            details = ${logUpdateData.details}, 
            date = ${logUpdateData.date}, 
            amount = ${logUpdateData.amount}, 
            paid = ${logUpdateData.paid}
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (updatedLog.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Log not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedLog[0])
      };

    case 'DELETE':
      const logId = body.id;
      if (!logId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Log ID is required' })
        };
      }
      
      await sql`DELETE FROM logs WHERE id = ${logId}`;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Log deleted successfully' })
      };

    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
  }
}

// Handle cycle operations
async function handleCycles(method, body, headers) {
  switch (method) {
    case 'GET':
      const cycles = await sql`
        SELECT c.*, cl.name as client_name 
        FROM cycles c 
        LEFT JOIN clients cl ON c.client_id = cl.id 
        ORDER BY c.date DESC
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cycles)
      };

    case 'POST':
      const { clientId, logIds, total, date } = body;
      if (!clientId || !logIds || !total || !date) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Client ID, log IDs, total, and date are required' })
        };
      }
      
      // Create the cycle
      const newCycle = await sql`
        INSERT INTO cycles (client_id, log_ids, total, date) 
        VALUES (${clientId}, ${JSON.stringify(logIds)}, ${total}, ${date})
        RETURNING *
      `;
      
      // Mark logs as paid
      await sql`
        UPDATE logs 
        SET paid = true 
        WHERE id = ANY(${logIds})
      `;
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newCycle[0])
      };

    case 'PUT':
      const { id, ...cycleUpdateData } = body;
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Cycle ID is required' })
        };
      }
      
      const updatedCycle = await sql`
        UPDATE cycles 
        SET client_id = ${cycleUpdateData.clientId}, 
            log_ids = ${JSON.stringify(cycleUpdateData.logIds)}, 
            total = ${cycleUpdateData.total}, 
            date = ${cycleUpdateData.date}
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (updatedCycle.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Cycle not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedCycle[0])
      };

    case 'DELETE':
      const cycleId = body.id;
      if (!cycleId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Cycle ID is required' })
        };
      }
      
      // Get log IDs before deleting cycle
      const cycle = await sql`SELECT log_ids FROM cycles WHERE id = ${cycleId}`;
      if (cycle.length > 0) {
        // Mark logs as unpaid
        await sql`
          UPDATE logs 
          SET paid = false 
          WHERE id = ANY(${cycle[0].log_ids})
        `;
      }
      
      await sql`DELETE FROM cycles WHERE id = ${cycleId}`;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Cycle deleted successfully' })
      };

    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
  }
}

// Get all data for dashboard
async function handleGetAll(headers) {
  try {
    const [clients, logs, cycles] = await Promise.all([
      sql`SELECT * FROM clients ORDER BY name`,
      sql`SELECT l.*, c.name as client_name FROM logs l LEFT JOIN clients c ON l.client_id = c.id ORDER BY l.date DESC`,
      sql`SELECT c.*, cl.name as client_name FROM cycles c LEFT JOIN clients cl ON c.client_id = cl.id ORDER BY c.date DESC`
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ clients, logs, cycles })
    };
  } catch (error) {
    console.error('Error fetching all data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
}
