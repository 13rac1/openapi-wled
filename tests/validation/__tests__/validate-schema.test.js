const Ajv = require('ajv');
const { validateResponse, resolveSchema, generateReport } = require('../../../validation/scripts/validate-schema');

describe('validate-schema.js', () => {
  describe('validateResponse', () => {
    it('should validate a correct response', () => {
      const schema = {
        type: 'object',
        properties: { foo: { type: 'string' } },
        required: ['foo']
      };
      const response = { foo: 'bar' };
      const result = validateResponse(response, schema, 'test-endpoint');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.endpoint).toBe('test-endpoint');
    });

    it('should return errors for an invalid response', () => {
      const schema = {
        type: 'object',
        properties: { foo: { type: 'string' } },
        required: ['foo']
      };
      const response = { bar: 123 };
      const result = validateResponse(response, schema, 'test-endpoint');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.endpoint).toBe('test-endpoint');
    });
  });

  describe('resolveSchema', () => {
    it('should resolve a direct schema', () => {
      const schema = { type: 'string' };
      expect(resolveSchema(schema, {})).toEqual({ type: 'string' });
    });

    it('should resolve a $ref schema', () => {
      const rootSchema = {
        components: {
          schemas: {
            Foo: { type: 'object', properties: { bar: { type: 'string' } } }
          }
        }
      };
      const schema = { $ref: '#/components/schemas/Foo' };
      expect(resolveSchema(schema, rootSchema)).toEqual({ type: 'object', properties: { bar: { type: 'string' } } });
    });

    it('should resolve arrays of schemas', () => {
      const arr = [{ type: 'string' }, { type: 'number' }];
      expect(resolveSchema(arr, {})).toEqual([{ type: 'string' }, { type: 'number' }]);
    });

    it('should resolve nested objects', () => {
      const obj = { foo: { type: 'string' }, bar: { type: 'number' } };
      expect(resolveSchema(obj, {})).toEqual(obj);
    });
  });

  describe('generateReport', () => {
    it('should generate a summary and details', () => {
      const results = [
        { valid: true, errors: [], endpoint: 'foo' },
        { valid: false, errors: [{ instancePath: '/bar', message: 'should be string', params: {} }], endpoint: 'bar' }
      ];
      const report = generateReport(results);
      expect(report.summary.total).toBe(2);
      expect(report.summary.valid).toBe(1);
      expect(report.summary.invalid).toBe(1);
      expect(report.details.length).toBe(2);
      expect(report.details[1].errors[0].message).toBe('should be string');
    });
  });
}); 