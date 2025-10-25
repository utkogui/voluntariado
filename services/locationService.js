const { prisma } = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// Estados e cidades de demonstração (quando não há banco de dados)
const demoStates = [
  { id: 'AC', name: 'Acre', region: 'Norte', capital: 'Rio Branco' },
  { id: 'AL', name: 'Alagoas', region: 'Nordeste', capital: 'Maceió' },
  { id: 'AP', name: 'Amapá', region: 'Norte', capital: 'Macapá' },
  { id: 'AM', name: 'Amazonas', region: 'Norte', capital: 'Manaus' },
  { id: 'BA', name: 'Bahia', region: 'Nordeste', capital: 'Salvador' },
  { id: 'CE', name: 'Ceará', region: 'Nordeste', capital: 'Fortaleza' },
  { id: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste', capital: 'Brasília' },
  { id: 'ES', name: 'Espírito Santo', region: 'Sudeste', capital: 'Vitória' },
  { id: 'GO', name: 'Goiás', region: 'Centro-Oeste', capital: 'Goiânia' },
  { id: 'MA', name: 'Maranhão', region: 'Nordeste', capital: 'São Luís' },
  { id: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste', capital: 'Cuiabá' },
  { id: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste', capital: 'Campo Grande' },
  { id: 'MG', name: 'Minas Gerais', region: 'Sudeste', capital: 'Belo Horizonte' },
  { id: 'PA', name: 'Pará', region: 'Norte', capital: 'Belém' },
  { id: 'PB', name: 'Paraíba', region: 'Nordeste', capital: 'João Pessoa' },
  { id: 'PR', name: 'Paraná', region: 'Sul', capital: 'Curitiba' },
  { id: 'PE', name: 'Pernambuco', region: 'Nordeste', capital: 'Recife' },
  { id: 'PI', name: 'Piauí', region: 'Nordeste', capital: 'Teresina' },
  { id: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste', capital: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste', capital: 'Natal' },
  { id: 'RS', name: 'Rio Grande do Sul', region: 'Sul', capital: 'Porto Alegre' },
  { id: 'RO', name: 'Rondônia', region: 'Norte', capital: 'Porto Velho' },
  { id: 'RR', name: 'Roraima', region: 'Norte', capital: 'Boa Vista' },
  { id: 'SC', name: 'Santa Catarina', region: 'Sul', capital: 'Florianópolis' },
  { id: 'SP', name: 'São Paulo', region: 'Sudeste', capital: 'São Paulo' },
  { id: 'SE', name: 'Sergipe', region: 'Nordeste', capital: 'Aracaju' },
  { id: 'TO', name: 'Tocantins', region: 'Norte', capital: 'Palmas' }
];

const demoCities = [
  // São Paulo
  { id: '1', name: 'São Paulo', state: 'SP', region: 'Sudeste', population: 12396372, coordinates: { lat: -23.5505, lng: -46.6333 } },
  { id: '2', name: 'Guarulhos', state: 'SP', region: 'Sudeste', population: 1392121, coordinates: { lat: -23.4538, lng: -46.5333 } },
  { id: '3', name: 'Campinas', state: 'SP', region: 'Sudeste', population: 1223237, coordinates: { lat: -22.9056, lng: -47.0608 } },
  { id: '4', name: 'São Bernardo do Campo', state: 'SP', region: 'Sudeste', population: 844483, coordinates: { lat: -23.6939, lng: -46.5650 } },
  { id: '5', name: 'Santo André', state: 'SP', region: 'Sudeste', population: 721368, coordinates: { lat: -23.6639, lng: -46.5383 } },
  
  // Rio de Janeiro
  { id: '6', name: 'Rio de Janeiro', state: 'RJ', region: 'Sudeste', population: 6747815, coordinates: { lat: -22.9068, lng: -43.1729 } },
  { id: '7', name: 'Nova Iguaçu', state: 'RJ', region: 'Sudeste', population: 823302, coordinates: { lat: -22.7559, lng: -43.4606 } },
  { id: '8', name: 'Niterói', state: 'RJ', region: 'Sudeste', population: 515317, coordinates: { lat: -22.8833, lng: -43.1036 } },
  
  // Minas Gerais
  { id: '9', name: 'Belo Horizonte', state: 'MG', region: 'Sudeste', population: 2530701, coordinates: { lat: -19.9167, lng: -43.9345 } },
  { id: '10', name: 'Uberlândia', state: 'MG', region: 'Sudeste', population: 699097, coordinates: { lat: -18.9186, lng: -48.2772 } },
  { id: '11', name: 'Contagem', state: 'MG', region: 'Sudeste', population: 668949, coordinates: { lat: -19.9167, lng: -44.0833 } },
  
  // Bahia
  { id: '12', name: 'Salvador', state: 'BA', region: 'Nordeste', population: 2886698, coordinates: { lat: -12.9714, lng: -38.5014 } },
  { id: '13', name: 'Feira de Santana', state: 'BA', region: 'Nordeste', population: 619609, coordinates: { lat: -12.2667, lng: -38.9667 } },
  
  // Ceará
  { id: '14', name: 'Fortaleza', state: 'CE', region: 'Nordeste', population: 2703391, coordinates: { lat: -3.7172, lng: -38.5434 } },
  { id: '15', name: 'Caucaia', state: 'CE', region: 'Nordeste', population: 368918, coordinates: { lat: -3.7333, lng: -38.6667 } },
  
  // Paraná
  { id: '16', name: 'Curitiba', state: 'PR', region: 'Sul', population: 1963726, coordinates: { lat: -25.4244, lng: -49.2654 } },
  { id: '17', name: 'Londrina', state: 'PR', region: 'Sul', population: 575377, coordinates: { lat: -23.3103, lng: -51.1628 } },
  
  // Rio Grande do Sul
  { id: '18', name: 'Porto Alegre', state: 'RS', region: 'Sul', population: 1492530, coordinates: { lat: -30.0346, lng: -51.2177 } },
  { id: '19', name: 'Caxias do Sul', state: 'RS', region: 'Sul', population: 517451, coordinates: { lat: -29.1681, lng: -51.1794 } },
  
  // Pernambuco
  { id: '20', name: 'Recife', state: 'PE', region: 'Nordeste', population: 1653461, coordinates: { lat: -8.0476, lng: -34.8770 } },
  { id: '21', name: 'Jaboatão dos Guararapes', state: 'PE', region: 'Nordeste', population: 706867, coordinates: { lat: -8.1128, lng: -35.0147 } },
  
  // Distrito Federal
  { id: '22', name: 'Brasília', state: 'DF', region: 'Centro-Oeste', population: 3094325, coordinates: { lat: -15.7801, lng: -47.9292 } },
  
  // Goiás
  { id: '23', name: 'Goiânia', state: 'GO', region: 'Centro-Oeste', population: 1555626, coordinates: { lat: -16.6864, lng: -49.2643 } },
  
  // Pará
  { id: '24', name: 'Belém', state: 'PA', region: 'Norte', population: 1506420, coordinates: { lat: -1.4558, lng: -48.5044 } },
  
  // Amazonas
  { id: '25', name: 'Manaus', state: 'AM', region: 'Norte', population: 2255903, coordinates: { lat: -3.1190, lng: -60.0217 } }
];

// Verificar se o banco está disponível
const isDatabaseAvailable = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      return false;
    }
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
};

// Obter todos os estados
const getAllStates = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      return {
        success: true,
        data: demoStates,
        demo: true
      };
    }

    const states = await prisma.state.findMany({
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: states
    };
  } catch (error) {
    return {
      success: true,
      data: demoStates,
      demo: true
    };
  }
};

// Obter cidades por estado
const getCitiesByState = async (stateId) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const filteredCities = demoCities.filter(city => city.state === stateId);
      return {
        success: true,
        data: filteredCities,
        state: stateId,
        demo: true
      };
    }

    const cities = await prisma.city.findMany({
      where: { stateId },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: cities,
      state: stateId
    };
  } catch (error) {
    return {
      success: true,
      data: demoCities.filter(city => city.state === stateId),
      state: stateId,
      demo: true
    };
  }
};

// Buscar cidades por nome
const searchCities = async (query) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const filteredCities = demoCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        success: true,
        data: filteredCities,
        query,
        demo: true
      };
    }

    const cities = await prisma.city.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: cities,
      query
    };
  } catch (error) {
    return {
      success: true,
      data: demoCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
      ),
      query,
      demo: true
    };
  }
};

// Calcular distância entre duas coordenadas (Haversine)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Buscar cidades próximas
const getNearbyCities = async (lat, lng, radiusKm = 50) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const nearbyCities = demoCities.filter(city => {
        if (!city.coordinates) return false;
        const distance = calculateDistance(lat, lng, city.coordinates.lat, city.coordinates.lng);
        return distance <= radiusKm;
      }).map(city => ({
        ...city,
        distance: calculateDistance(lat, lng, city.coordinates.lat, city.coordinates.lng)
      })).sort((a, b) => a.distance - b.distance);
      
      return {
        success: true,
        data: nearbyCities,
        center: { lat, lng },
        radius: radiusKm,
        demo: true
      };
    }

    // Em um cenário real, você usaria uma consulta espacial do PostgreSQL
    const cities = await prisma.city.findMany({
      where: {
        latitude: {
          gte: lat - (radiusKm / 111), // Aproximação: 1 grau ≈ 111 km
          lte: lat + (radiusKm / 111)
        },
        longitude: {
          gte: lng - (radiusKm / 111),
          lte: lng + (radiusKm / 111)
        }
      }
    });

    const nearbyCities = cities.map(city => ({
      ...city,
      distance: calculateDistance(lat, lng, city.latitude, city.longitude)
    })).filter(city => city.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return {
      success: true,
      data: nearbyCities,
      center: { lat, lng },
      radius: radiusKm
    };
  } catch (error) {
    return {
      success: true,
      data: [],
      center: { lat, lng },
      radius: radiusKm,
      demo: true
    };
  }
};

// Obter estatísticas de localização
const getLocationStats = async () => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      const stats = {
        totalStates: demoStates.length,
        totalCities: demoCities.length,
        citiesByRegion: demoCities.reduce((acc, city) => {
          acc[city.region] = (acc[city.region] || 0) + 1;
          return acc;
        }, {}),
        citiesByState: demoCities.reduce((acc, city) => {
          acc[city.state] = (acc[city.state] || 0) + 1;
          return acc;
        }, {}),
        mostPopulatedCities: demoCities
          .sort((a, b) => b.population - a.population)
          .slice(0, 10)
          .map(city => ({ name: city.name, state: city.state, population: city.population }))
      };
      
      return {
        success: true,
        data: stats,
        demo: true
      };
    }

    const totalStates = await prisma.state.count();
    const totalCities = await prisma.city.count();

    const citiesByRegion = await prisma.city.groupBy({
      by: ['region'],
      _count: true
    });

    const citiesByState = await prisma.city.groupBy({
      by: ['stateId'],
      _count: true
    });

    return {
      success: true,
      data: {
        totalStates,
        totalCities,
        citiesByRegion: citiesByRegion.reduce((acc, item) => {
          acc[item.region] = item._count;
          return acc;
        }, {}),
        citiesByState: citiesByState.reduce((acc, item) => {
          acc[item.stateId] = item._count;
          return acc;
        }, {})
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Validar CEP
const validateCEP = async (cep) => {
  try {
    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      return {
        success: false,
        error: 'CEP deve ter 8 dígitos'
      };
    }

    // Simulação de validação de CEP (em produção, usaria uma API real)
    const isValid = /^\d{8}$/.test(cleanCEP);
    
    if (!isValid) {
      return {
        success: false,
        error: 'CEP inválido'
      };
    }

    // Simulação de busca de endereço por CEP
    const mockAddress = {
      cep: cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2'),
      logradouro: 'Rua Exemplo',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      coordinates: { lat: -23.5505, lng: -46.6333 }
    };

    return {
      success: true,
      data: mockAddress,
      demo: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  getAllStates,
  getCitiesByState,
  searchCities,
  getNearbyCities,
  getLocationStats,
  validateCEP,
  calculateDistance
};


