from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from base.models import Portfolio
from ..serializers import Portfolio_POST_serializer

#adds portfolio to user
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_portfolio(request):
    
    # get name of portfolio in request
    portfolio_name_request = request.data["portfolio_name"]
    
    #get userid of request
    user_id_request = request.user.id

    #append user id to request
    request.data["user"] = user_id_request
    request.data["portfolio_name"] = portfolio_name_request.lower()

    #copy value of in_cash to added_funds
    request.data["added_funds"] = request.data["in_cash"]
    
    
    # Check if portfolio name already exists within user portfolios
    if Portfolio.objects.filter(user_id=user_id_request, portfolio_name=portfolio_name_request).exists():
        return Response("Already exists", status=status.HTTP_400_BAD_REQUEST)
    
    # Check if valid, then create entry or return error
    serializer = Portfolio_POST_serializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_portfolio(request):
    Portfolio.objects.filter(user_id=request.user.id, portfolio_name=request.data["portfolio_name"].lower()).delete()
    return Response("Deleted", status=status.HTTP_200_OK)
