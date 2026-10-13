const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const schemaPath = path.join(__dirname, 'schema.xml');
const xmlData = fs.readFileSync(schemaPath, 'utf8');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});
const parsedSchema = parser.parse(xmlData).DatabaseSchema;

function getMongoSchema(collectionName) {
  const mongoDb = parsedSchema.MongoDB;
  if (!mongoDb || !mongoDb.Collection) return null;
  
  const collections = Array.isArray(mongoDb.Collection) ? mongoDb.Collection : [mongoDb.Collection];
  const target = collections.find(c => c["@_name"] === collectionName);
  
  if (!target || !target.Fields || !target.Fields.Field) return null;
  
  const fields = Array.isArray(target.Fields.Field) ? target.Fields.Field : [target.Fields.Field];
  
  return fields.map(f => ({
    name: f["@_name"],
    type: f["@_type"]
  }));
}

function getNeo4jSchema(nodeLabel) {
  const neo4j = parsedSchema.Neo4j;
  if (!neo4j || !neo4j.Nodes || !neo4j.Nodes.Node) return null;
  
  const nodes = Array.isArray(neo4j.Nodes.Node) ? neo4j.Nodes.Node : [neo4j.Nodes.Node];
  const target = nodes.find(n => n["@_label"] === nodeLabel);
  
  if (!target || !target.Properties || !target.Properties.Property) return null;
  
  const props = Array.isArray(target.Properties.Property) ? target.Properties.Property : [target.Properties.Property];
  
  return props.map(p => ({
    name: p["@_name"],
    type: p["@_type"]
  }));
}

// Builds a MongoDB projection object dynamically from XML schema
function buildMongoProjection(collectionName) {
  const schema = getMongoSchema(collectionName);
  if (!schema) return {};
  const projection = {};
  schema.forEach(field => {
    projection[field.name] = 1;
  });
  return projection;
}

// Builds a Neo4j RETURN string dynamically from XML schema
function buildNeo4jReturn(nodeLabel, alias = 'n') {
  const schema = getNeo4jSchema(nodeLabel);
  if (!schema) return `${alias}`;
  return schema.map(field => `${alias}.${field.name} AS ${field.name}`).join(', ');
}

module.exports = {
  parsedSchema,
  getMongoSchema,
  getNeo4jSchema,
  buildMongoProjection,
  buildNeo4jReturn
};
