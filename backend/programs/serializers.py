# Names: Daniel, Jacob, Maharshi, Ben
# Total time: 15 mins 

from rest_framework import serializers
from .models import Program

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'description', 'latitude', 'longitude']